<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartProduct, CartStall } from '$lib/stores/cart'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Button } from '$lib/components/ui/button'
	import * as Select from '$lib/components/ui/select'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import ProductInCart from '../cart/product-in-cart.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import PaymentProcessor from './paymentProcessor.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	const dispatch = createEventDispatcher()

	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null

	$: selectedPaymentValue = selectedPaymentDetail && {
		label: `${selectedPaymentDetail.paymentMethod} - ${selectedPaymentDetail.paymentDetails}`,
		value: selectedPaymentDetail,
	}

	$: orderTotal = cart.calculateStallTotal(stall, products)

	const paymentRequest = 'lnbc500n1pn2vehkpp5m22vruwkcvvru...'

	function handlePaymentComplete(event: CustomEvent<{ preimage: string }>) {
		console.log('Payment event in orderPayment', event.detail)
		// dispatch('paymentComplete', { orderId: order.id })
	}
	function handlePaymentExpired() {
		// selectedPaymentDetail = null;
		// You might want to add additional logic here
	}
</script>

<div class="flex gap-8">
	<div class="w-1/2 flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			{#each stall.products as productId}
				<ProductInCart product={products[productId]} mode="payment" />
			{/each}
		</div>

		<Separator />

		{#await orderTotal}
			<div class="text-center">Calculating total...</div>
		{:then total}
			<div class="flex flex-col gap-2">
				{#each [{ label: 'Subtotal', value: total.subtotalInSats }, { label: 'Shipping', value: total.shippingInSats }, { label: 'Total', value: total.totalInSats, bold: true }] as { label, value, bold }}
					<div class="flex justify-between" class:font-bold={bold}>
						<span>{label}:</span>
						<span>{formatSats(value)} sats</span>
					</div>
				{/each}
			</div>
		{/await}
	</div>

	<div class="w-1/2 flex flex-col items-center gap-4">
		<Select.Root
			selected={selectedPaymentValue ?? undefined}
			onSelectedChange={(s) => {
				if (!s) return
				selectedPaymentDetail = s.value
			}}
		>
			<Select.Trigger class="w-full">
				<Select.Value placeholder="Select a payment method" />
			</Select.Trigger>
			<Select.Content>
				{#each relevantPaymentDetails as paymentDetail}
					<Select.Item value={paymentDetail} label={`${paymentDetail.paymentMethod} - ${paymentDetail.paymentDetails}`} />
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- {#if selectedPaymentDetail}
			<div class="text-center">
				<h3 class="font-bold">{selectedPaymentDetail.id}</h3>
				<p>{selectedPaymentDetail.paymentMethod}</p>
				{#if selectedPaymentDetail.paymentDetails}
					<p class="text-sm break-all">{selectedPaymentDetail.paymentDetails}</p>
				{/if}
			</div>


		<div class="flex justify-center">
			<QrCode data={paymentRequest} logoPath="/logo.svg" />
		</div>

		<div class="flex gap-2 justify-center">
			{#await orderTotal}
				<Button disabled>Calculating total...</Button>
			{:then total}
				<Button class="flex items-center gap-2" on:click={handlePaymentComplete}>
					Pay {formatSats(total.totalInSats)} sats
				</Button>
			{/await}
			<Button variant="ghost" class="flex items-center gap-2">
				Open in app <span class="i-mdi-external-link" />
			</Button>
		</div>
		{/if} -->
		{#if selectedPaymentDetail}
			{#await orderTotal}
				<p>Calculating total...</p>
			{:then total}
				{#key selectedPaymentDetail}
					<PaymentProcessor
						paymentDetail={selectedPaymentDetail}
						amountSats={10}
						on:paymentComplete={handlePaymentComplete}
						on:paymentExpired={handlePaymentExpired}
					/>
				{/key}
			{/await}
		{/if}
	</div>
</div>
