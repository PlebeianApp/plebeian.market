<script lang="ts">
	import type { CartProduct, CartStall, CartUser } from '$lib/stores/cart'
	import { KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
	import { resolveQuery } from '$lib/utils'
	import { createEventDispatcher, onDestroy } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import MiniUser from './mini-user.svelte'
	import ProductInCart from './product-in-cart.svelte'

	export let user: CartUser
	export let stalls: Record<string, CartStall>
	export let products: Record<string, CartProduct>
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

	async function calculateOrderTotals(
		userStalls: string[],
	): Promise<{ totalInSats: number; totalInCurrency: number; shippingInSats: number; shippingCurrency: number; currency: string }> {
		let totalSats = 0
		let shippingSats = 0
		let totalInCurrency = 0
		let shippingCurrency = 0
		let currency = ''

		const stallTotalsPromises = userStalls.map(async (stallId) => {
			const stall = stalls[stallId]
			if (stall.currency) currency = stall.currency

			const stallTotal = stall.products.reduce((total, productId) => {
				const product = products[productId]
				return total + product.price * product.amount
			}, 0)

			const [stallTotalInSats, shippingSatsPromise] = await Promise.all([
				resolveQuery(() => createCurrencyConversionQuery(stall.currency, stallTotal)),
				stall.shippingCost ? resolveQuery(() => createCurrencyConversionQuery(stall.currency, stall.shippingCost)) : Promise.resolve(0),
			])

			return {
				stallTotalInSats: stallTotalInSats || 0,
				shippingSats: shippingSatsPromise || 0,
				stallTotal,
				shippingCost: stall.shippingCost,
			}
		})

		const stallTotals = await Promise.all(stallTotalsPromises)

		for (const { stallTotalInSats, shippingSats: _shippingSats, stallTotal, shippingCost } of stallTotals) {
			totalSats += stallTotalInSats
			shippingSats += _shippingSats
			totalInCurrency += stallTotal
			shippingCurrency += shippingCost
		}

		return { totalInSats: totalSats, totalInCurrency, shippingInSats: shippingSats, shippingCurrency, currency }
	}
	$: orderTotalsPromise = calculateOrderTotals(user.stalls)

	$: {
		orderTotalsPromise.then(({ totalInSats, shippingInSats }) => {
			dispatch('orderTotalUpdate', { userPubkey: user.pubkey, totalInSats, shippingInSats })
		})
	}

	onDestroy(() => {
		dispatch('orderTotalUpdate', { userPubkey: user.pubkey, totalInSats: 0, shippingInSats: 0 })
	})
</script>

<div class="order">
	<MiniUser userId={user.pubkey} />

	{#each user.stalls as stallId}
		{@const stall = stalls[stallId]}
		<div class="stall">
			<MiniStall stallId={stallId.split(':').length !== 3 ? `${KindStalls}:${user.pubkey}:${stallId}` : stallId} userPubkey={user.pubkey} />

			{#each stall.products as productId}
				{@const product = products[productId]}
				<ProductInCart
					{product}
					on:increment={(e) => handleProductUpdate(e, stallId, productId)}
					on:decrement={(e) => handleProductUpdate(e, stallId, productId)}
					on:setAmount={(e) => handleProductUpdate(e, stallId, productId)}
					on:remove={(e) => handleProductUpdate(e, stallId, productId)}
				/>
			{/each}
		</div>
	{/each}

	{#if mode === 'cart'}
		{#await orderTotalsPromise}
			<Spinner />
		{:then { totalInSats, totalInCurrency, shippingInSats, shippingCurrency, currency }}
			<div class="flex flex-col">
				<small>Shipping: {shippingInSats.toLocaleString()} sats ({shippingCurrency} {currency})</small>
				<small>Stall total: {totalInSats.toLocaleString()} sats ({totalInCurrency} {currency})</small>
			</div>
		{:catch error}
			Error calculating total {error}
		{/await}
	{:else if mode === 'checkout'}
		<!-- Checkout mode UI -->
	{:else if mode === 'payment'}
		<!-- Payment mode UI -->
	{/if}
</div>
<Separator />
