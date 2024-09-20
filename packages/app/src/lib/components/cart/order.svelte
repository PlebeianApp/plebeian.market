<script lang="ts">
	import type { CartProduct, CartStall, CartUser } from '$lib/stores/cart'
	import { KindStalls } from '$lib/constants'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher, onDestroy } from 'svelte'

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
	let v4vTotalPercentage: number | null = null

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

	$: v4vQuery = v4VForUserQuery(user.pubkey)

	$: {
		if ($v4vQuery.data) {
			const total = $v4vQuery.data.reduce((sum, item) => {
				return sum + item.amount
			}, 0)
			v4vTotalPercentage = total
		}
	}

	$: if ($cart) {
		updateUserTotal()
	}

	onDestroy(() => {
		dispatch('orderTotalUpdate', { userPubkey: user.pubkey, totalInSats: 0, shippingInSats: 0 })
	})
</script>

<div class="order p-2 flex flex-col gap-2">
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
		<div class="flex flex-col gap-2">
			{#each Object.entries(userTotal.currencyTotals) as [currency, amounts]}
				<small>{currency} Total: {(amounts.total + amounts.shipping).toLocaleString()} </small>
			{/each}
			<small>Shipping in sats: {formatSats(userTotal.shippingInSats)} sats</small>
			<small class="underline"
				><strong>Total in sats:</strong>
				{formatSats(userTotal.totalInSats)} sats</small
			>
			<Separator />
			{#if v4vTotalPercentage}
				<div class="flex flex-col justify-end">
					<small>
						{formatSats(userTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)))} sats ({(1 - (v4vTotalPercentage ?? 0)) * 100}% of
						subtotal)</small
					>
					<small> + {formatSats(userTotal.shippingInSats)} sats shipping</small>
					<span class="underline"
						>Merchant share: {formatSats(userTotal.subtotalInSats * (1 - v4vTotalPercentage) + userTotal.shippingInSats)} sats</span
					>
				</div>
				<div class="flex items-center">
					<small class="text-muted-foreground font-semibold"
						>V4V 🤙 share ({(v4vTotalPercentage * 100).toFixed(2)}%):
						{formatSats(userTotal.subtotalInSats * v4vTotalPercentage)} sats
					</small>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if mode !== 'checkout'}
	<Separator />
{/if}
