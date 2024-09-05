<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'

	import Button from '../ui/button/button.svelte'

	export let merchant: CartUser

	let isLoading = false

	$: paymentDetails = createPaymentsForUserQuery(merchant.pubkey)
</script>

<div class="w-1/2 mx-auto flex flex-col gap-4">
	<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="cart" on:productUpdate={cart.handleProductUpdate} />
	<div class="flex justify-between gap-4">
		<Button
			variant="ghost"
			class="w-full"
			disabled={isLoading}
			on:click={async () => {
				isLoading = true
				await cart.placeOrders(merchant.pubkey)
				currentStep.set($paymentDetails.data?.length ? $currentStep + 2 : $currentStep + 1)
				isLoading = false
			}}>Order</Button
		>
		{#if $paymentDetails.data?.length}
			<Button
				class="w-full"
				disabled={isLoading}
				on:click={async () => {
					isLoading = true
					await cart.placeOrders(merchant.pubkey)
					currentStep.set($currentStep + 1)
					isLoading = false
				}}>Order & Pay</Button
			>
		{/if}
	</div>
</div>
