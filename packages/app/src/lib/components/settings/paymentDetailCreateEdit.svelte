<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { LightningAddress } from '@getalby/lightning-tools'
	import { Button } from '$lib/components/ui/button'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import * as Select from '$lib/components/ui/select'
	import { deletePaymentMethodMutation, persistPaymentMethodMutation, updatePaymentMethodMutation } from '$lib/fetch/payments.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'
	import { NIP05_REGEX } from 'nostr-tools/nip05'

	import type { PaymentDetailsMethod } from '@plebeian/database'
	import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

	import Spinner from '../assets/spinner.svelte'

	export let paymentDetail: RichPaymentDetail | null = null
	export let paymentDetailMethods: PaymentDetailsMethod[]

	let isEditing = !!paymentDetail
	let isOpen = false
	let isLoading = false
	let validationMessage = ''

	let editedPaymentDetail = paymentDetail
		? { ...paymentDetail }
		: {
				id: '',
				userId: $ndkStore.activeUser?.pubkey ?? '',
				paymentMethod: PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK,
				paymentDetails: '',
				stallId: null,
				stallName: 'General',
				isDefault: false,
			}

	$: isDisabled = !editedPaymentDetail.stallId
	$: stallsQuery = $ndkStore.activeUser?.pubkey
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
				pageSize: 999,
			})
		: null

	const paymentMethodLabels: Record<PaymentDetailsMethod, string> = {
		[PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK]: 'Lightning Address',
		[PAYMENT_DETAILS_METHOD.ON_CHAIN]: 'Onchain Address',
	}

	const paymentMethodIcons: Record<PaymentDetailsMethod, string> = {
		[PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK]: 'i-mingcute-lightning-line',
		[PAYMENT_DETAILS_METHOD.ON_CHAIN]: 'i-mingcute-anchor-line',
	}

	const validationMethods: Record<PaymentDetailsMethod, (value: string) => Promise<boolean>> = {
		[PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK]: async (value) => {
			if (NIP05_REGEX.test(value)) {
				const ln = new LightningAddress(value)
				await ln.fetch()
				return !!ln.lnurlpData
			}
			return false
		},
		[PAYMENT_DETAILS_METHOD.ON_CHAIN]: async (value) => {
			const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{39,59}$/
			return btcRegex.test(value)
		},
	}

	async function validateInput(value: string, method: PaymentDetailsMethod): Promise<boolean> {
		const validationMethod = validationMethods[method]
		if (!validationMethod) {
			validationMessage = 'Unknown payment method'
			return false
		}

		const isValid = await validationMethod(value)
		validationMessage = isValid ? '' : `Invalid ${paymentMethodLabels[method]}`
		return isValid
	}

	async function handleSubmit() {
		if (!editedPaymentDetail.paymentDetails) {
			validationMessage = 'Please fill in the payment details'
			return
		}

		isLoading = true
		validationMessage = 'Validating...'

		try {
			const isValid = await validateInput(editedPaymentDetail.paymentDetails, editedPaymentDetail.paymentMethod)
			if (!isValid) return

			validationMessage = 'Saving...'
			if (isEditing) {
				await $updatePaymentMethodMutation.mutateAsync({
					paymentDetails: editedPaymentDetail.paymentDetails,
					paymentMethod: editedPaymentDetail.paymentMethod,
					stallId: editedPaymentDetail.stallId,
					paymentDetailId: editedPaymentDetail.id,
					isDefault: editedPaymentDetail.isDefault,
				})
			} else {
				await $persistPaymentMethodMutation.mutateAsync({
					paymentDetails: editedPaymentDetail.paymentDetails,
					paymentMethod: editedPaymentDetail.paymentMethod,
					stallId: editedPaymentDetail.stallId,
					isDefault: editedPaymentDetail.isDefault,
				})
			}

			isOpen = false
			if (!isEditing) {
				editedPaymentDetail = {
					id: '',
					userId: $ndkStore.activeUser?.pubkey ?? '',
					paymentMethod: PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK,
					paymentDetails: '',
					stallId: null,
					stallName: 'General',
					isDefault: false,
				}
			}
		} catch (error) {
			validationMessage = 'An error occurred while saving'
			console.error('Error saving payment method:', error)
		} finally {
			isLoading = false
		}
	}

	function handleDelete() {
		if (isEditing && editedPaymentDetail.id) {
			$deletePaymentMethodMutation.mutate({
				paymentDetailId: editedPaymentDetail.id,
				userId: $ndkStore.activeUser?.pubkey as string,
			})
		}
	}

	$: if (!isOpen) validationMessage = ''
</script>

<div class="border flex flex-col p-4 justify-between">
	<Collapsible.Root bind:open={isOpen}>
		<Collapsible.Trigger on:click={() => (isOpen = !isOpen)} class="flex flex-row w-full justify-between items-center gap-2">
			{#if isEditing}
				<div class="flex flex-row gap-2 items-center">
					<span class={paymentMethodIcons[editedPaymentDetail.paymentMethod] + ' w-6 h-6'} />
					<span class="truncate">{editedPaymentDetail.paymentDetails}</span>
				</div>
				<div class="flex flex-row gap-2 items-center">
					{#if editedPaymentDetail.stallId}
						{#if editedPaymentDetail.isDefault}
							<span class="i-mdi-star text-yellow-400 w-6 h-6" />
						{/if}
						<span class="font-bold">{editedPaymentDetail.stallName}</span>
						<span class="i-tdesign-store w-6 h-6" />
					{:else}
						<span class="font-bold">General</span>
						<span class="i-mingcute-earth-2-line w-6 h-6" />
					{/if}
				</div>
			{:else}
				<span class="flex items-center gap-2">
					<span class="i-mingcute-plus-line w-6 h-6" />
					Add new payment method
				</span>
			{/if}
		</Collapsible.Trigger>

		<Collapsible.Content class="flex flex-col gap-4 py-4">
			<div class="flex flex-row gap-4 items-start">
				<div class="w-full">
					<Label for="payment-details" class="font-medium">Payment Method</Label>
					<Select.Root
						selected={{
							value: editedPaymentDetail.paymentMethod,
							label: paymentMethodLabels[editedPaymentDetail.paymentMethod],
						}}
						onSelectedChange={(sEvent) => {
							if (sEvent) {
								editedPaymentDetail.paymentMethod = sEvent.value
							}
						}}
						name="paymentMethod"
					>
						<Select.Trigger class="focus:border-2 focus:ring-2">
							<Select.Value placeholder="Payment method" />
						</Select.Trigger>
						<Select.Content>
							{#each paymentDetailMethods as method}
								<Select.Item value={method}>
									<div class="flex items-center gap-2">
										<span class={paymentMethodIcons[method] + ' w-5 h-5'} />
										{paymentMethodLabels[method]}
									</div>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="w-full">
					<Label for="payment-details" class="font-medium">Stall</Label>
					<Select.Root
						selected={{
							value: editedPaymentDetail.stallId,
							label: editedPaymentDetail.stallName,
						}}
						onSelectedChange={(sEvent) => {
							if (sEvent?.value === null) {
								editedPaymentDetail.stallId = null
								editedPaymentDetail.stallName = 'General'
								editedPaymentDetail.isDefault = false
							} else if (sEvent?.value && sEvent?.label) {
								editedPaymentDetail.stallId = sEvent.value
								editedPaymentDetail.stallName = sEvent.label
								editedPaymentDetail.isDefault = false
							}
						}}
						name="assignStallForPaymentMethod"
					>
						<Select.Trigger class=" focus:border-2 focus:ring-2">
							<Select.Value placeholder="Assign a stall" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={null}>
								<div class="flex items-center gap-2">
									<span class="i-mingcute-earth-2-line w-5 h-5" />
									General
								</div>
							</Select.Item>
							{#if $stallsQuery && $stallsQuery.data}
								{#each $stallsQuery.data.stalls as stall}
									<Select.Item value={stall.id}>
										<div class="flex items-center gap-2">
											<span class="i-tdesign-store w-5 h-5" />
											{stall.name}
										</div>
									</Select.Item>
								{/each}
							{/if}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="payment-details" class="font-medium">Payment details</Label>
				<Input
					id="payment-details"
					bind:value={editedPaymentDetail.paymentDetails}
					class="w-full border"
					placeholder="Enter payment details"
					disabled={isLoading}
				/>
			</div>

			{#if validationMessage && !isLoading}
				<p class="text-red-500 text-sm">{validationMessage}</p>
			{:else if isLoading}
				<Spinner />
			{/if}

			<div class="flex items-center gap-2">
				<Checkbox id="default-payment" bind:checked={editedPaymentDetail.isDefault} disabled={isDisabled} class="border" />
				<Label for="default-payment" class="font-medium">Default</Label>
			</div>

			<div class="flex flex-row-reverse gap-2 mt-4">
				<Button type="submit" on:click={handleSubmit} disabled={isLoading} class="font-bold py-2 px-4">
					{#if isLoading}<Spinner />{/if}
					{isLoading ? 'Validating...' : isEditing ? 'Update' : 'Save'}
				</Button>
				{#if isEditing}
					<Button variant="destructive" on:click={handleDelete} disabled={isLoading} class="font-bold py-2 px-4">
						<span class="i-mdi-trash w-6 h-6 cursor-pointer" />
					</Button>
				{/if}
				<Button variant="outline" on:click={() => (isOpen = false)} disabled={isLoading} class="font-bold py-2 px-4">Cancel</Button>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
