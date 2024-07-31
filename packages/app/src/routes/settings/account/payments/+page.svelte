<script lang="ts">
	import type { Selected } from 'bits-ui'
	import PaymentDetailEdit from '$lib/components/settings/payment-detail-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import { Content, Group, Item, Root, Trigger } from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { persistPaymentMethodMutation } from '$lib/fetch/payments.mutations'
	import { paymentsQuery } from '$lib/fetch/payments.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PaymentDetailsMethod } from '@plebeian/database'

	import type { PageData } from './$types'

	export let data: PageData
	const { paymentDetailsMethod } = data

	let newPaymentMethodOpen: PaymentDetailsMethod | null = null
	let newPaymentDetails: string | null = null
	let selectedStall: Selected<string | null> | undefined = undefined
	let isDefault: boolean = false
	$: isDisabled = selectedStall === undefined || selectedStall?.value === null

	$: stallsQuery = $ndkStore.activeUser?.pubkey
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
				pageSize: 999,
			})
		: null

	const handleAddPaymentMethodLine = (method: string) => {
		newPaymentMethodOpen = method as PaymentDetailsMethod
	}

	const handleCancelAddPaymentMethod = () => {
		newPaymentMethodOpen = null
		newPaymentDetails = null
	}

	const handlePersistNewPaymentMethod = async () => {
		const res = await $persistPaymentMethodMutation.mutateAsync({
			paymentDetails: newPaymentDetails as string,
			paymentMethod: newPaymentMethodOpen as string,
			stallId: selectedStall?.value ?? null,
			isDefault,
		})
		if (res) {
			newPaymentMethodOpen = null
			newPaymentDetails = null
			selectedStall = undefined
			isDefault = false
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex justify-between items-center">
		<h3 class="text-xl">Payment details</h3>
	</div>

	{#if $paymentsQuery.isLoading}
		<p>Loading...</p>
	{:else}
		{#each [...($paymentsQuery.data ?? [])] as paymentDetail}
			<PaymentDetailEdit {paymentDetail} {paymentDetailsMethod} />
		{/each}
	{/if}

	{#if newPaymentMethodOpen}
		<div class="flex flex-col gap-4">
			<Separator class="mb-2" />
			<form class="flex flex-col w-full items-center gap-2">
				<label for="paymentDetails" class="font-bold">
					{#if newPaymentMethodOpen === paymentDetailsMethod[0]}
						Lightning Address
					{:else if newPaymentMethodOpen === paymentDetailsMethod[1]}
						Onchain Address
					{:else if newPaymentMethodOpen === paymentDetailsMethod[2]}
						Cashu Details
					{:else if newPaymentMethodOpen === paymentDetailsMethod[3]}
						Other Details
					{/if}
				</label>
				<Input required bind:value={newPaymentDetails} id="paymentDetails" placeholder="Enter payment details" />
				<div class="flex flex-row w-full items-center gap-2">
					<div class="flex flex-col gap-1 flex-grow items-start">
						<Label class="truncate font-bold">Select stall</Label>
						<Select bind:selected={selectedStall} name="stallForPaymentMehtod">
							<SelectTrigger class="border-black border-2">
								<SelectValue placeholder="Select stall" />
							</SelectTrigger>
							<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
								<SelectItem value={null}>General</SelectItem>
								{#if $stallsQuery && $stallsQuery.data}
									{#each $stallsQuery.data.stalls as stall}
										<div class="flex items-center gap-2">
											<SelectItem value={stall.id}>{stall.name}</SelectItem>
										</div>
									{/each}
								{/if}
							</SelectContent>
						</Select>
					</div>

					<div class="flex flex-col items-center gap-3">
						<Label class="truncate font-bold">Default</Label>
						<Checkbox required class="border-black border-2" name="allowRegister" bind:disabled={isDisabled} bind:checked={isDefault} />
					</div>
				</div>

				<div class="flex w-full gap-4">
					<Button class="w-full font-bold" variant="outline" on:click={handleCancelAddPaymentMethod}>Cancel</Button>
					<Button type="submit" class="w-full font-bold" on:click={handlePersistNewPaymentMethod}>Save</Button>
				</div>
			</form>
		</div>
	{:else}
		<Root>
			<Trigger
				><Button class="w-full font-bold" variant="outline">Add payment method <span class="i-mingcute-plus-line w-6 h-6" /></Button
				></Trigger
			>
			<Content>
				<Group>
					{#each paymentDetailsMethod as paymentMethod}
						<Item on:click={() => handleAddPaymentMethodLine(paymentMethod)}>
							{#if paymentMethod === paymentDetailsMethod[0]}
								<div class="flex items-center gap-2">
									<span class="i-mingcute-lightning-line w-6 h-6" />
									<span>Lightning</span>
								</div>
							{:else if paymentMethod === paymentDetailsMethod[1]}
								<div class="flex items-center gap-2">
									<span class="i-mingcute-anchor-line w-6 h-6" />
									<span>Onchain</span>
								</div>
							{:else if paymentMethod === paymentDetailsMethod[2]}
								<div class="flex items-center gap-2">
									<span class="i-tdesign-nut w-6 h-6" />
									<span>Cashu</span>
								</div>
							{:else if paymentMethod === paymentDetailsMethod[3]}
								<div class="flex items-center gap-2">
									<span class="i-mingcute-question-line w-6 h-6" />
									<span>Other</span>
								</div>
							{/if}
						</Item>
					{/each}
				</Group>
			</Content>
		</Root>
	{/if}
</div>
