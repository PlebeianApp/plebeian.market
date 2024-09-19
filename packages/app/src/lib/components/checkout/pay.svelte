<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { cart } from '$lib/stores/cart'
	import { truncateString } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import MiniStall from '../cart/mini-stall.svelte'
	import OrderPayment from './orderPayment.svelte'

	export let merchant: CartUser

	let currentOrderIndex = 0
	const dispatch = createEventDispatcher()

	$: relevantOrders = Object.entries($cart.orders).filter(([_, order]) => order.sellerUserId === merchant.pubkey)
	$: currentOrder = relevantOrders[currentOrderIndex]

	$: merchantProfile = createUserByIdQuery(merchant.pubkey)

	function handleValidPayment(event: CustomEvent) {
		console.log(event.detail)
		if (currentOrderIndex < relevantOrders.length - 1) {
			currentOrderIndex++
		} else {
			dispatch('validate', { valid: true })
		}
	}
</script>

<div class="w-full mx-auto flex flex-col gap-4">
	{#if $merchantProfile.data}
		<h2 class="text-2xl font-bold text-center">
			Payment for {$merchantProfile.data.name || $merchantProfile.data.displayName || truncateString(merchant.pubkey)}
		</h2>
	{/if}
	<p class="text-center">Order {currentOrderIndex + 1} of {relevantOrders.length}</p>

	{#if currentOrder}
		<MiniStall stallId={currentOrder[1].stallId} mode="view" />
		<OrderPayment
			order={currentOrder[1]}
			stall={$cart.stalls[currentOrder[1].stallId]}
			products={$cart.products}
			on:valid={handleValidPayment}
		/>
	{/if}
</div>
