<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query'
	import { createToken } from '$lib/apiUtils'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Content, Group, Item, Root, Trigger } from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { deletePaymentMethodMutation, persistPaymentMethodMutation } from '$lib/fetch/mutations'
	import { paymentsQuery } from '$lib/fetch/queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PaymentDetail, PaymentDetailsMethod } from '@plebeian/database'

	import type { PageData } from './$types'

	const queryClient = useQueryClient()

	export let data: PageData
	const { paymentDetailsMethod } = data

	let newPaymentMethodOpen: PaymentDetailsMethod | null = null
	let newPaymentDetails: string | null = null

	const handleAddPaymentMethodLine = (method: PaymentDetailsMethod) => {
		newPaymentMethodOpen = method
	}

	const handleCancelAddPaymentMethod = () => {
		newPaymentMethodOpen = null
		newPaymentDetails = null
	}

	const handlePersistNewPaymentMethod = async () => {
		const res = await $persistPaymentMethodMutation.mutateAsync({
			paymentDetails: newPaymentDetails as string,
			paymentMethod: newPaymentMethodOpen as string,
		})

		if (res) {
			newPaymentMethodOpen = null
			newPaymentDetails = null
		}
	}

	const handleDeletePaymentMethod = async (paymentDetailId: string) => {
		$deletePaymentMethodMutation.mutate({
			paymentDetailId,
			userId: $ndkStore.activeUser?.pubkey as string,
		})
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
			<div class="border border-gray flex justify-between items-center p-2 font-bold">
				<div class="flex items-center gap-2">
					{#if paymentDetail.paymentMethod === paymentDetailsMethod[0]}
						<span class="i-mingcute-lightning-line w-6 h-6" />
						<span>Lightning</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[1]}
						<span class="i-mingcute-anchor-line w-6 h-6" />
						<span>Onchain</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[2]}
						<span class="i-tdesign-nut w-6 h-6" />
						<span>Cashu</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[3]}
						<span class="i-mingcute-question-line w-6 h-6" />
						<span>Other</span>
						<span>{paymentDetail.paymentDetails}</span>
					{/if}
				</div>
				<Button class="font-bold" variant="outline" on:click={() => handleDeletePaymentMethod(paymentDetail.id)}>
					<span class="i-mdi-trash w-6 h-6" /></Button
				>
			</div>
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
