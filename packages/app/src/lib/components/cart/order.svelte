<script lang="ts">
	import type { CartProduct, CartStall, CartUser } from '$lib/stores/cart'
	import { Button } from '$lib/components/ui/button/index.js'
	import { KindStalls } from '$lib/constants'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'

	import type { Order } from '@plebeian/database'

	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import MiniUser from './mini-user.svelte'
	import ProductInCart from './product-in-cart.svelte'

	export let user: CartUser
	export let stalls: Record<string, CartStall>
	export let products: Record<string, CartProduct>
	export let mode: 'cart' | 'checkout' | 'payment' | 'success' = 'cart'
	export let formData: Partial<Order> = {}

	export let userTotal: Awaited<ReturnType<typeof cart.calculateUserTotal>> | null = null

	$: hasFormData = Object.keys(formData).length > 0
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

	function updateUserTotal() {
		cart.calculateUserTotal(user.pubkey).then((result) => (userTotal = result))
	}

	$: if ($cart) {
		updateUserTotal()
	}

	onDestroy(() => {
		dispatch('orderTotalUpdate', { userPubkey: user.pubkey, totalInSats: 0, shippingInSats: 0 })
	})
</script>

<div class="order p-2">
	{#if mode !== 'checkout'}
		<MiniUser userId={user.pubkey} />
	{/if}

	{#each user.stalls as stallId}
		{@const stall = stalls[stallId]}
		<div class="stall">
			<MiniStall
				stallId={stallId.split(':').length !== 3 ? `${KindStalls}:${user.pubkey}:${stallId}` : stallId}
				mode={mode === 'success' ? 'view' : undefined}
			/>

			{#each stall.products as productId}
				{@const product = products[productId]}
				<ProductInCart
					{product}
					mode={mode === 'success' ? 'payment' : undefined}
					on:increment={(e) => handleProductUpdate(e, stallId, productId)}
					on:decrement={(e) => handleProductUpdate(e, stallId, productId)}
					on:setAmount={(e) => handleProductUpdate(e, stallId, productId)}
					on:remove={(e) => handleProductUpdate(e, stallId, productId)}
				/>
			{/each}
		</div>
	{/each}

	{#if (mode === 'cart' || mode === 'checkout') && userTotal}
		<div class="flex flex-col">
			{#each Object.entries(userTotal.currencyTotals) as [currency, amounts]}
				<small>{currency} Total: {(amounts.total + amounts.shipping).toLocaleString()} </small>
			{/each}
			<small>Shipping in sats: {formatSats(userTotal.shippingInSats)} sats</small>
			<small
				><strong>Total in sats:</strong>
				{formatSats(userTotal.totalInSats)} sats</small
			>
		</div>
	{:else if mode === 'payment' && hasFormData}
		<Button on:click={() => console.log(formData)}>Send</Button>
	{/if}
</div>

{#if mode !== 'checkout'}
	<Separator />
{/if}
