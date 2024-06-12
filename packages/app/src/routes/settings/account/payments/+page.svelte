<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import { Content, Group, Item, Root, Trigger } from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { persistPaymentMethodMutation } from '$lib/fetch/mutations'
	import { createStallsByFilterQuery, paymentsQuery } from '$lib/fetch/queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PaymentDetailsMethod } from '@plebeian/database'

	import type { PageData } from './$types'
	import PaymentDetailEdit from '/src/lib/components/settings/payment-detail-edit.svelte'

	export let data: PageData
	const { paymentDetailsMethod } = data

	let newPaymentMethodOpen: PaymentDetailsMethod | null = null
	let newPaymentDetails: string | null = null
	let selectedStall: { value: string; label: string } | null = null

	$: stallsQuery = $ndkStore.activeUser?.pubkey
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
			})
		: null

	const handleAddPaymentMethodLine = (method: PaymentDetailsMethod) => {
		newPaymentMethodOpen = method
	}

	const handleCancelAddPaymentMethod = () => {
		newPaymentMethodOpen = null
		newPaymentDetails = null
	}

	const handlePersistNewPaymentMethod = async () => {
		console.log('newPaymentDetails', newPaymentDetails)
		console.log('newPaymentMethodOpen', newPaymentMethodOpen)
		console.log('selectedStall', selectedStall)

		const res = await $persistPaymentMethodMutation.mutateAsync({
			paymentDetails: newPaymentDetails as string,
			paymentMethod: newPaymentMethodOpen as string,
			stallId: selectedStall?.value,
		})
		if (res) {
			newPaymentMethodOpen = null
			newPaymentDetails = null
			selectedStall = null
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
				<Input bind:value={newPaymentDetails} id="paymentDetails" placeholder="Enter payment details" />

				<Label class="truncate font-bold">Select stall</Label>
				<Select bind:selected={selectedStall} name="stallForPaymentMehtod">
					<SelectTrigger class="border-black border-2">
						<SelectValue placeholder="Select stall" />
					</SelectTrigger>
					<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
						{#each $stallsQuery.data as stall}
							<div class="flex items-center gap-2">
								<SelectItem value={stall.id}>{stall.name}</SelectItem>
							</div>
						{/each}
					</SelectContent>
				</Select>

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
