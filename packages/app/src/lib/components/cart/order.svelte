<script lang="ts">
	import { KindStalls } from '$lib/constants'
	import { createEventDispatcher } from 'svelte'

	import type { CartStall, CartUser } from './types'
	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import MiniUser from './mini-user.svelte'
	import ProductInCart from './product-in-cart.svelte'

	export let user: CartUser
	export let mode: 'cart' | 'checkout' | 'payment' = 'cart'

	const dispatch = createEventDispatcher()

	function handleProductUpdate(event: CustomEvent, stallId: string, productId: string) {
		const action = event.detail?.action
		if (!action) {
			console.error('Invalid event detail:', event.detail)
			return
		}

		dispatch('productUpdate', {
			action,
			userPubkey: user.pubkey,
			stallId,
			productId,
			amount: event.detail.amount,
		})
	}

	function calculateOrderTotal(stalls: CartStall[]): number {
		return stalls.reduce(
			(total, stall) =>
				total + stall.products.reduce((stallTotal, product) => stallTotal + product.price * product.amount, 0) + (stall.shippingCost || 0),
			0,
		)
	}
	$: orderTotal = calculateOrderTotal(user.stalls)
</script>

<div class="order">
	<MiniUser userId={user.pubkey} />

	{#each user.stalls as stall}
		<div class="stall">
			<MiniStall
				stallId={stall.id.split(':').length !== 3 ? `${KindStalls}:${user.pubkey}:${stall.id}` : stall.id}
				userPubkey={user.pubkey}
			/>

			{#each stall.products as product}
				<ProductInCart
					{product}
					on:increment={(e) => handleProductUpdate(e, stall.id, product.id)}
					on:decrement={(e) => handleProductUpdate(e, stall.id, product.id)}
					on:setAmount={(e) => handleProductUpdate(e, stall.id, product.id)}
					on:remove={(e) => handleProductUpdate(e, stall.id, product.id)}
				/>
			{/each}

			{#if stall.shippingCost}
				<div class="shipping-cost">
					Shipping: ${stall.shippingCost.toFixed(2)}
				</div>
			{/if}
		</div>
	{/each}

	<div class="order-total">
		Subtotal: ${orderTotal.toFixed(2)}
	</div>

	{#if mode === 'cart'}
		<!-- <button on:click={() => dispatch('proceedToCheckout', { userPubkey: user.pubkey })}>
        Proceed to Checkout
      </button> -->
	{:else if mode === 'checkout'}
		<!-- Add checkout-specific UI elements -->
	{:else if mode === 'payment'}
		<!-- Add payment-specific UI elements -->
	{/if}
</div>
<Separator />
