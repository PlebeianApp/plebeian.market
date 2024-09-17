<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartInvoice, CartProduct, CartStall } from '$lib/stores/cart'
	import * as Select from '$lib/components/ui/select'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import { createId } from '@plebeian/database/utils'

	import ProductInCart from '../cart/product-in-cart.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import PaymentProcessor from './paymentProcessor.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	const dispatch = createEventDispatcher<{
		valid: boolean
	}>()

	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null

	$: selectedPaymentValue = selectedPaymentDetail && {
		label: `${selectedPaymentDetail.paymentMethod} - ${selectedPaymentDetail.paymentDetails}`,
		value: selectedPaymentDetail,
	}

	let orderTotal: Awaited<ReturnType<typeof cart.calculateStallTotal>>
	// TODO: once the payment is complete (succesful or not send the invoice as dm)
	function handlePaymentComplete(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		try {
			const invoice: CartInvoice = {
				id: createId(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
				orderId: order.id!,
				totalAmount: formatSats(orderTotal.totalInSats, false),
				invoiceStatus: 'paid',
				paymentDetails: selectedPaymentDetail.id,
				paymentRequest: event.detail.paymentRequest,
				proof: event.detail.preimage,
			}
			cart.addInvoice(invoice)
			dispatch('valid', true)
		} catch (e) {
			console.warn('Error handling complete payment', `${e}`)
		}
	}
	function handlePaymentExpired(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		const invoice: CartInvoice = {
			id: createId(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id!,
			totalAmount: formatSats(orderTotal.totalInSats, false),
			invoiceStatus: 'expired',
			paymentDetails: selectedPaymentDetail.id,
			paymentRequest: event.detail.paymentRequest,
			proof: event.detail.preimage,
		}

		cart.addInvoice(invoice)
		dispatch('valid', true)
	}

	function handlePaymentCanceled(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		const invoice: CartInvoice = {
			id: createId(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id!,
			totalAmount: formatSats(orderTotal.totalInSats, false),
			invoiceStatus: 'canceled',
			paymentDetails: selectedPaymentDetail.id,
			paymentRequest: event.detail.paymentRequest,
			proof: event.detail.preimage,
		}
		console.log('a canceled invoice', invoice)
		cart.addInvoice(invoice)
		dispatch('valid', true)
	}

	async function calculateOrderTotal() {
		orderTotal = await cart.calculateStallTotal(stall, products)
	}

	$: {
		order
		calculateOrderTotal()
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

		{#if orderTotal}
			<div class="flex flex-col gap-2">
				{#each [{ label: 'Subtotal', value: orderTotal.subtotalInSats }, { label: 'Shipping', value: orderTotal.shippingInSats }, { label: 'Total', value: orderTotal.totalInSats, bold: true }] as { label, value, bold }}
					<div class="flex justify-between" class:font-bold={bold}>
						<span>{label}:</span>
						<span>{formatSats(value)} sats</span>
					</div>
				{/each}
			</div>
		{/if}
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

		{#if selectedPaymentDetail && orderTotal}
			{#key selectedPaymentDetail}
				<!-- use orderTotal.totalInSats in amountSats prop -->
				<PaymentProcessor
					paymentDetail={selectedPaymentDetail}
					amountSats={5}
					on:paymentComplete={handlePaymentComplete}
					on:paymentExpired={handlePaymentExpired}
					on:paymentCanceled={handlePaymentCanceled}
				/>
			{/key}
		{/if}
	</div>
</div>
