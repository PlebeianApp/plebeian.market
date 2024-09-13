<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartProduct, CartStall } from '$lib/stores/cart'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Button } from '$lib/components/ui/button'
	import { cart } from '$lib/stores/cart'
	import { createEventDispatcher } from 'svelte'

	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import ProductInCart from './product-in-cart.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	const dispatch = createEventDispatcher()

	let orderTotal: {
		subtotalInSats: number
		shippingInSats: number
		totalInSats: number
		subtotalInCurrency: number
		shippingInCurrency: number
		totalInCurrency: number
		currency: string
	} | null = null

	let paymentRequest: string = 'lnbc500n1pn2vehkpp5m22vruwkcvvru...' // This should be generated based on the order

	$: {
		cart.calculateStallTotal(stall, products).then((total) => {
			orderTotal = total
		})
	}

	function handlePaymentComplete() {
		dispatch('paymentComplete', { orderId: order.id })
	}
</script>

<div class="flex gap-8">
	<!-- Left column: Products -->
	<div class="w-1/2 flex flex-col gap-4">
		<!-- <MiniStall stall={stall} /> -->

		<div class="flex flex-col gap-2">
			{#each stall.products as productId}
				<ProductInCart product={products[productId]} />
			{/each}
		</div>

		<Separator />

		{#if orderTotal}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between">
					<span>Subtotal:</span>
					<span>{orderTotal.subtotalInCurrency.toFixed(2)} {orderTotal.currency} ({orderTotal.subtotalInSats} sats)</span>
				</div>
				<div class="flex justify-between">
					<span>Shipping:</span>
					<span>{orderTotal.shippingInCurrency.toFixed(2)} {orderTotal.currency} ({orderTotal.shippingInSats} sats)</span>
				</div>
				<div class="flex justify-between font-bold">
					<span>Total:</span>
					<span>{orderTotal.totalInCurrency.toFixed(2)} {orderTotal.currency} ({orderTotal.totalInSats} sats)</span>
				</div>
			</div>
		{:else}
			<div class="text-center">Calculating total...</div>
		{/if}
	</div>

	<!-- Right column: QR code and action buttons -->
	<div class="w-1/2 flex flex-col items-center gap-4">
		<div class="flex justify-center">
			<QrCode data={paymentRequest} logoPath="/logo.svg" />
		</div>

		<div class="flex gap-2 justify-center">
			<Button class="flex items-center gap-2" on:click={handlePaymentComplete}>
				Pay {orderTotal ? `${orderTotal.totalInSats} sats` : ''}
			</Button>
			<Button variant="ghost" class="flex items-center gap-2">
				Open in app <span class="i-mdi-external-link" />
			</Button>
		</div>
	</div>
</div>
