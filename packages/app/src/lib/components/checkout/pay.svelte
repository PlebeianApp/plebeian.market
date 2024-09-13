<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { Button } from '$lib/components/ui/button'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'

	import OrderPayment from '../cart/orderPayment.svelte'

	export let merchant: CartUser

	const paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

	let completedPayments: string[] = []
	let currentOrderIndex = 0

	$: relevantOrders = Object.entries($cart.orders).filter(([_, order]) => order.sellerUserId === merchant.pubkey)

	$: currentOrder = relevantOrders[currentOrderIndex]

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
	<h2 class="text-2xl font-bold text-center">Payment for {merchant.pubkey}</h2>
	<p class="text-center">Order {currentOrderIndex + 1} of {relevantOrders.length}</p>

	{#if currentOrder}
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
