<script lang="ts">
	import { cart, cartTotal } from '$lib/stores/cart'

	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import Order from './order.svelte'

	function handleProductUpdate(event: CustomEvent) {
		const { action, userPubkey, stallId, productId, amount } = event.detail
		if (action === 'increment' || action === 'decrement') {
			const currentAmount =
				$cart
					.find((u) => u.pubkey === userPubkey)
					?.stalls.find((s) => s.id === stallId)
					?.products.find((p) => p.id === productId)?.amount ?? 0

			cart.updateProductAmount(userPubkey, stallId, productId, action === 'increment' ? currentAmount + 1 : Math.max(currentAmount - 1, 0))
		} else if (action === 'setAmount') {
			cart.updateProductAmount(userPubkey, stallId, productId, amount)
		} else if (action === 'remove') {
			cart.removeProduct(userPubkey, stallId, productId)
		}
	}

	function handleProceedToCheckout(event: CustomEvent) {
		const { userPubkey } = event.detail
		console.log(`Proceeding to checkout for user ${userPubkey}`)
	}
</script>

<div class="flex flex-col justify-between w-full">
	<h1>Your Cart</h1>
	<ScrollArea class="flex-grow max-h-[75vh]">
		{#each $cart as user}
			<Order {user} mode="cart" on:productUpdate={handleProductUpdate} on:proceedToCheckout={handleProceedToCheckout} />
		{/each}
	</ScrollArea>
	<div class="cart-totals">
		<div class="grand-total">
			Grand Total: {$cartTotal.toFixed(2)}
		</div>
	</div>
</div>
