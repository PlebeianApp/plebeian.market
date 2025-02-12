<script lang="ts">
	import type { CartProduct, CartStall, CartUser } from '$lib/stores/cart'
	import { Label } from '$lib/components/ui/label/index.js'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import { formatSats, parseCoordinatesString } from '$lib/utils'
	import { createEventDispatcher, onDestroy } from 'svelte'

	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import MiniUser from './mini-user.svelte'
	import ProductInCart from './product-in-cart.svelte'

	export let user: CartUser
	export let stalls: Record<string, CartStall>
	export let products: Record<string, CartProduct>
	export let mode: 'cart' | 'checkout' | 'payment' | 'success' = 'cart'
	let v4vTotalPercentage: number | null = null
	export let userTotal: Awaited<ReturnType<typeof cart.calculateUserTotal>> | null = null

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
				stallCoordinate={parseCoordinatesString(stallId).coordinates || ''}
				mode={mode == 'success' || mode == 'cart' ? 'view' : undefined}
			/>
			<!-- TODO: Improve shipping visualization for products with shipping cost 0 and extra cost -->
			{#each stall.products as productId}
				{@const product = products[productId]}
				<ProductInCart
					{product}
					mode={mode === 'success' || mode == 'checkout' ? 'payment' : undefined}
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
			{#if v4vTotalPercentage}
				<div class="">
					<Label class="font-bold">Payment Breakdown</Label>
					<div class="relative mt-4 w-full h-2 bg-gray-200 rounded-lg overflow-hidden h-4 rounded-lg">
						<div
							class="absolute inset-y-0 left-0 bg-primary flex items-center justify-center text-xs text-primary-foreground"
							style="width: {(1 - v4vTotalPercentage) * 100}%;"
							data-tooltip="Merchant: {formatSats(userTotal.subtotalInSats * (1 - v4vTotalPercentage))} sats ({(
								(1 - v4vTotalPercentage) *
								100
							).toFixed(2)}%)"
						/>

						<div
							class="absolute inset-y-0 right-0 bg-blue-500 flex items-center justify-center text-xs text-white"
							style="width: {v4vTotalPercentage * 100}%;"
							data-tooltip="Community Share: {formatSats(userTotal.subtotalInSats * v4vTotalPercentage)} sats ({(
								v4vTotalPercentage * 100
							).toFixed(2)}%)"
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if mode !== 'checkout'}
	<Separator />
{/if}
