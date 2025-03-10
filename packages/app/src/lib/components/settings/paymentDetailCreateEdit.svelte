<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { LightningAddress } from '@getalby/lightning-tools'
	import { Button } from '$lib/components/ui/button'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import * as Select from '$lib/components/ui/select'
	import { standardDisplayDateFormat } from '$lib/constants'
	import { deletePaymentMethodMutation, persistPaymentMethodMutation, updatePaymentMethodMutation } from '$lib/fetch/payments.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { deleteWalletMutation } from '$lib/fetch/wallets.mutations'
	import { createOnChainIndexQuery } from '$lib/fetch/wallets.queries'
	import ndkStore from '$lib/stores/ndk'
	import {
		checkAddress,
		checkExtendedPublicKey,
		deriveAddresses,
		isExtendedPublicKey,
		parsePaymentDetailsFromClipboard,
		paymentMethodIcons,
		paymentMethodLabels,
	} from '$lib/utils/paymentDetails.utils'
	import { isValidNip05 } from '$lib/utils/validation.utils'
	import { format } from 'date-fns'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { PaymentDetailsMethod } from '@plebeian/database/constants'
	import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

	import type { onChainConfirmationType } from './types'
	import Spinner from '../assets/spinner.svelte'
	import PaymentGuidance from '../common/paymentGuidance.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import PaymentDetailConfirmationCard from './paymentDetailConfirmationCard.svelte'

	export let paymentDetail: RichPaymentDetail | null = null
	export let showGuidance: boolean = false

	export let isOpen = false
	let formState: 'idle' | 'validating' | 'confirming' | 'submitting' = 'idle'
	let validationMessage = ''
	let showConfirmation = false
	let tempValidatedValue = ''
	let confirmationType: onChainConfirmationType

	const dispatch = createEventDispatcher<{ success: unknown; error: unknown }>()
	const paymentDetailMethods = Object.values(PAYMENT_DETAILS_METHOD) as PaymentDetailsMethod[]

	$: isEditing = !!paymentDetail
	$: isDisabled = !editedPaymentDetail.stallId
	$: if (!isOpen) validationMessage = ''

	let editedPaymentDetail: RichPaymentDetail = paymentDetail
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

	$: stallsQuery = $ndkStore.activeUser?.pubkey
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
				pageSize: 999,
			})
		: null

	$: onChainWalletIndexQuery =
		paymentDetail?.paymentMethod === 'on-chain' && isExtendedPublicKey(editedPaymentDetail.paymentDetails)
			? createOnChainIndexQuery(String($ndkStore.activeUser?.pubkey), paymentDetail.id)
			: undefined

	const validationMethods: Record<PaymentDetailsMethod, (value: string) => Promise<boolean | 'needsConfirmation'>> = {
		[PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK]: async (value) => {
			if (isValidNip05(value)) {
				const ln = new LightningAddress(value)
				await ln.fetch()
				return !!ln.lnurlpData
			}
			return false
		},
		[PAYMENT_DETAILS_METHOD.ON_CHAIN]: async (value) => {
			if (isExtendedPublicKey(value)) {
				confirmationType = 'extended_public_key'
				return checkExtendedPublicKey(value) ? 'needsConfirmation' : false
			}
			if (value.startsWith('bc1')) {
				confirmationType = 'single_address'
				return checkAddress(value) ? 'needsConfirmation' : false
			}
			return false
		},
	}

	async function validateAndConfirm(event?: Event) {
		if (event) event.preventDefault()
		if (!editedPaymentDetail.paymentDetails) {
			validationMessage = 'Please fill in the payment details'
			return
		}

		formState = 'validating'
		validationMessage = 'Validating...'

		try {
			const result = await validationMethods[editedPaymentDetail.paymentMethod](editedPaymentDetail.paymentDetails)

			if (result === 'needsConfirmation') {
				formState = 'confirming'
				tempValidatedValue = editedPaymentDetail.paymentDetails
				showConfirmation = true
			} else if (result) {
				handleSubmit()
			} else {
				formState = 'idle'
				validationMessage = `Invalid ${paymentMethodLabels[editedPaymentDetail.paymentMethod]}`
			}
		} catch (error) {
			formState = 'idle'
			validationMessage = 'An error occurred during validation'
			console.error('Validation error:', error)
		}
	}

	async function handleSubmit() {
		formState = 'submitting'
		validationMessage = 'Saving...'

		try {
			const mutationPayload = {
				paymentDetails: editedPaymentDetail.paymentDetails,
				paymentMethod: editedPaymentDetail.paymentMethod,
				stallId: editedPaymentDetail.stallId,
				isDefault: editedPaymentDetail.isDefault,
			}

			if (isEditing) {
				await $updatePaymentMethodMutation.mutateAsync({
					...mutationPayload,
					paymentDetailId: editedPaymentDetail.id,
				})
			} else {
				await $persistPaymentMethodMutation.mutateAsync(mutationPayload)
			}

			isOpen = false
			if (!isEditing) resetForm()
			validationMessage = ''
			if (!isEditing) dispatch('success', null)
		} catch (error) {
			validationMessage = 'An error occurred while saving'
			console.error('Error saving payment method:', error)
		} finally {
			formState = 'idle'
		}
	}

	function resetForm() {
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

	function setupPaymentDetail(paymentDetails: string, method: PaymentDetailsMethod) {
		editedPaymentDetail = {
			...editedPaymentDetail,
			paymentDetails,
			paymentMethod: method,
			stallId: null,
			stallName: 'General',
			isDefault: false,
		}
		showGuidance = false
	}

	const handleConfirmation = () => {
		showConfirmation = false
		handleSubmit()
	}

	const handleCancellation = () => {
		showConfirmation = false
		formState = 'idle'
		validationMessage = 'Confirmation cancelled'
	}

	const handleCancelInput = () => {
		isOpen = false
		resetForm()
	}

	const handleDelete = () => {
		if (isEditing && editedPaymentDetail.id) {
			$deletePaymentMethodMutation.mutate({
				paymentDetailId: editedPaymentDetail.id,
				userId: $ndkStore.activeUser?.pubkey as string,
			})

			if (editedPaymentDetail.paymentMethod === 'on-chain' && isExtendedPublicKey(editedPaymentDetail.paymentDetails)) {
				$deleteWalletMutation.mutate({
					userId: $ndkStore.activeUser?.pubkey as string,
					paymentDetailId: editedPaymentDetail.id,
				})
			}
		}
	}

	function handleSetupPaymentDetail(event: CustomEvent) {
		const { paymentDetails, method } = event.detail
		setupPaymentDetail(paymentDetails, method)
	}

	const handleCloseGuidance = () => {
		showGuidance = false
	}

	async function handlePasteUnknownPaymentDetails() {
		const result = await parsePaymentDetailsFromClipboard()

		if (result.success && result.paymentDetails && result.method) {
			setupPaymentDetail(result.paymentDetails, result.method)
			isOpen = true
			toast.success(
				`${result.method === PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK ? 'Lightning Network' : 'On Chain'} payment details pasted`,
			)
		} else {
			toast.error(result.error || 'Unknown error')
		}
	}
</script>

<div class="border flex flex-col p-4 justify-between bg-white h-full rounded-md">
	<ScrollArea class="flex-1">
		<Collapsible.Root bind:open={isOpen}>
			<div class="flex flex-row w-full justify-between items-center gap-2">
				<Collapsible.Trigger on:click={() => (isOpen = !isOpen)} class="flex flex-row w-full justify-between items-center gap-2">
					{#if isEditing}
						<div class="grid grid-flow-col grid-cols-[1fr_auto] gap-2">
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
				{#if !showGuidance && !paymentDetail}
					<Button
						on:click={handlePasteUnknownPaymentDetails}
						size="icon"
						variant="ghost"
						data-tooltip="Paste payment details from clipboard and auto-detect."
						class="text-destructive border-0"
					>
						<span class="i-mingcute-clipboard-fill text-black w-6 h-6"></span>
					</Button>
				{/if}
			</div>

			<Collapsible.Content class="flex flex-col gap-4 py-4">
				{#if showConfirmation}
					<PaymentDetailConfirmationCard
						value={tempValidatedValue}
						type={confirmationType}
						on:confirm={handleConfirmation}
						on:cancel={handleCancellation}
					/>
				{:else if showGuidance}
					<PaymentGuidance
						userLightningAddress={$ndkStore.activeUser?.profile?.lud16}
						on:setupPaymentDetail={handleSetupPaymentDetail}
						on:closeGuidance={handleCloseGuidance}
						on:paste={handlePasteUnknownPaymentDetails}
					/>
				{:else}
					<form on:submit|preventDefault={validateAndConfirm} class="flex flex-col gap-4">
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
								<Label for="payment-details" class="font-medium">Shop</Label>
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
										<Select.Value placeholder="Assign a shop" />
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
								placeholder="Enter payment details e.g. plebeian@getalby.com"
							/>
							{#if $onChainWalletIndexQuery?.data && paymentDetail?.paymentDetails}
								<Label for="payment-details" class="font-medium">Current address</Label>
								<div class=" bg-secondary flex flex-col gap-2 p-2">
									<small
										>Index: {$onChainWalletIndexQuery.data.valueNumeric} - {deriveAddresses(
											paymentDetail.paymentDetails,
											1,
											Number($onChainWalletIndexQuery.data.valueNumeric),
										)}</small
									>
									<small>
										Last updated:
										{format($onChainWalletIndexQuery.data.updatedAt, standardDisplayDateFormat)}
									</small>
								</div>
							{/if}
						</div>

						{#if validationMessage && formState == 'idle'}
							<p class="text-red-500 text-sm">{validationMessage}</p>
						{:else if formState !== 'idle'}
							<Spinner />
						{/if}

						<div class="flex flex-col gap-2">
							<section class=" flex items-center gap-2">
								<Checkbox id="default-payment" bind:checked={editedPaymentDetail.isDefault} disabled={isDisabled} class="border" />
								<Label for="default-payment" class="font-medium">Default</Label>
							</section>
							<div class="flex flex-row-reverse gap-2 mt-4">
								<Button type="submit" disabled={formState !== 'idle'} class="font-bold py-2 px-4">
									{#if formState !== 'idle'}<Spinner />{/if}
									{formState === 'validating' ? 'Validating...' : formState === 'submitting' ? 'Saving...' : isEditing ? 'Update' : 'Save'}
								</Button>

								{#if isEditing}
									<Button variant="destructive" on:click={handleDelete} disabled={formState !== 'idle'} class="font-bold py-2 px-4">
										<span class="i-mdi-trash w-6 h-6 cursor-pointer" />
									</Button>
								{/if}

								<Button variant="tertiary" on:click={handleCancelInput} disabled={formState !== 'idle'} class="font-bold py-2 px-4">
									Cancel
								</Button>
							</div>
						</div>
					</form>
				{/if}
			</Collapsible.Content>
		</Collapsible.Root>
	</ScrollArea>
</div>
