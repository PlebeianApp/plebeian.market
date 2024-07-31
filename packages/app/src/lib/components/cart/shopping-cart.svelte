<script lang="ts">
	import { cart } from '$lib/stores/cart'
	import { onMount } from 'svelte'

	import Button from '../ui/button/button.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import Order from './order.svelte'

	let grandTotalInSats = 0
	let grandShippingInSats = 0
	let orderTotals: { [userPubkey: string]: { totalInSats: number; shippingInSats: number } } = {}

	function handleOrderTotalUpdate(event: CustomEvent) {
		const { userPubkey, totalInSats, shippingInSats } = event.detail
		orderTotals[userPubkey] = { totalInSats, shippingInSats }
		updateGrandTotals()
	}

	function updateGrandTotals() {
		const totals = Object.values(orderTotals)
		grandTotalInSats = totals.reduce((sum, { totalInSats }) => sum + totalInSats, 0)
		grandShippingInSats = totals.reduce((sum, { shippingInSats }) => sum + shippingInSats, 0)
	}

	function handleProductUpdate(event: CustomEvent) {
		const { action, userPubkey, stallId, productId, amount } = event.detail

		switch (action) {
			case 'increment':
				updateProductAmount(userPubkey, stallId, productId, (current) => current + 1)
				break
			case 'decrement':
				updateProductAmount(userPubkey, stallId, productId, (current) => Math.max(current - 1, 0))
				break
			case 'setAmount':
				updateProductAmount(userPubkey, stallId, productId, () => amount)
				break
			case 'remove':
				cart.removeProduct(userPubkey, stallId, productId)
				break
		}
	}

	function updateProductAmount(userPubkey: string, stallId: string, productId: string, updateFn: (current: number) => number) {
		const product = $cart.products[productId]
		if (product) {
			const newAmount = updateFn(product.amount)
			cart.updateProductAmount(userPubkey, stallId, productId, newAmount)
		}
	}

	function clearCart() {
		cart.clear()
		orderTotals = {}
		updateGrandTotals()
	}

	onMount(() => {
		orderTotals = Object.fromEntries(Object.keys($cart.users).map((userPubkey) => [userPubkey, { totalInSats: 0, shippingInSats: 0 }]))
	})
</script>

<div class="flex flex-col justify-between w-full h-full">
	<ScrollArea class="flex-grow pr-4 max-h-[calc(100vh-16rem)]">
		{#each Object.values($cart.users) as user (user.pubkey)}
			<Order
				{user}
				stalls={$cart.stalls}
				products={$cart.products}
				mode="cart"
				on:productUpdate={handleProductUpdate}
				on:orderTotalUpdate={handleOrderTotalUpdate}
			/>
		{/each}
	</ScrollArea>

	<div class="cart-totals mt-4 p-4 bg-gray-100 rounded-lg">
		{#if grandTotalInSats > 0}
			<div class="flex justify-between mb-2">
				<span>Subtotal:</span>
				<span>{(grandTotalInSats - grandShippingInSats).toLocaleString()} sats</span>
			</div>
			<div class="flex justify-between mb-2">
				<span>Shipping:</span>
				<span>{grandShippingInSats.toLocaleString()} sats</span>
			</div>
			<div class="flex justify-between font-bold text-lg">
				<span>Grand Total:</span>
				<span>{grandTotalInSats.toLocaleString()} sats</span>
			</div>
			<div class="flex justify-between mt-4">
				<Button variant="outline" on:click={clearCart}>Clear Cart</Button>
				<Button on:click={() => console.log('going to checkout')}>Proceed to Checkout</Button>
			</div>
		{:else}
			<p>Your cart is empty.</p>
		{/if}
	</div>
</div>
