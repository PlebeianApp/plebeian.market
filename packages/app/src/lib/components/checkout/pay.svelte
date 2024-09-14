<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { Button } from '$lib/components/ui/button'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import { truncateString } from '$lib/utils'

	import MiniStall from '../cart/mini-stall.svelte'
	import OrderPayment from './orderPayment.svelte'

	export let merchant: CartUser

	let completedPayments: string[] = []
	let currentOrderIndex = 0

	$: relevantOrders = Object.entries($cart.orders).filter(([_, order]) => order.sellerUserId === merchant.pubkey)
	$: currentOrder = relevantOrders[currentOrderIndex]

	$: merchantProfile = createUserByIdQuery(merchant.pubkey)
	function handlePaymentComplete(event: CustomEvent<{ orderId: string }>) {
		completedPayments = [...completedPayments, event.detail.orderId]
		if (currentOrderIndex < relevantOrders.length - 1) {
			currentOrderIndex++
		} else {
			// All payments are complete, move to the next step
			currentStep.set($currentStep + 1)
		}
	}

	function handleSkip() {
		if (currentOrderIndex < relevantOrders.length - 1) {
			currentOrderIndex++
		} else {
			// All orders skipped, move to the next step
			currentStep.set($currentStep + 1)
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
			on:paymentComplete={handlePaymentComplete}
		/>
	{/if}

	<div class="flex justify-center mt-4 gap-4">
		<Button variant="ghost" on:click={handleSkip}>Skip this payment</Button>
		<Button variant="ghost" on:click={() => currentStep.set($currentStep + 1)}>Skip all payments</Button>
	</div>
</div>
