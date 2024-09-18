<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartInvoice, CartProduct, CartStall } from '$lib/stores/cart'
	import * as Select from '$lib/components/ui/select'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'
	import { sendDM } from '$lib/utils/utils.dm'
	import { createEventDispatcher, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { OrderStatus, PaymentRequestMessage } from '@plebeian/database/constants'
	import { ORDER_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import ProductInCart from '../cart/product-in-cart.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import Separator from '../ui/separator/separator.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	const dispatch = createEventDispatcher<{ valid: boolean }>()

	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null

	$: selectedPaymentValue = selectedPaymentDetail && {
		label: `${selectedPaymentDetail.paymentMethod} - ${selectedPaymentDetail.paymentDetails}`,
		value: selectedPaymentDetail,
	}

	let orderTotal: Awaited<ReturnType<typeof cart.calculateStallTotal>>

	type PaymentStatus = 'paid' | 'expired' | 'canceled'
	const statusMapping: Record<PaymentStatus, OrderStatus> = {
		paid: ORDER_STATUS.PAID,
		expired: ORDER_STATUS.PENDING,
		canceled: ORDER_STATUS.PENDING,
	}
	const paymentEventToStatus: Record<string, PaymentStatus> = {
		paymentComplete: 'paid',
		paymentExpired: 'expired',
		paymentCanceled: 'canceled',
	}

	async function handlePaymentEvent(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		const status = paymentEventToStatus[event.type]
		if (!status) {
			console.error(`Unknown payment event type: ${event.type}`)
			return dispatch('valid', false)
		}

		if (!order?.id || !selectedPaymentDetail?.id) {
			toast.error(`Invalid order or payment details`)
			return dispatch('valid', false)
		}

		try {
			const invoice = createInvoice(event.detail, status)
			await processPayment(invoice, status)
			dispatch('valid', true)
		} catch (error) {
			console.error(`Error handling ${status} payment:`, error)
			toast.error(`Failed to process ${status} payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
			dispatch('valid', false)
		}
	}

	function createInvoice(detail: { paymentRequest: string; preimage: string | null }, status: PaymentStatus): CartInvoice {
		return {
			id: createId(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id,
			totalAmount: formatSats(orderTotal.totalInSats, false),
			invoiceStatus: status,
			paymentId: selectedPaymentDetail!.id,
			paymentRequest: detail.paymentRequest,
			proof: detail.preimage,
		}
	}

	async function processPayment(invoice: CartInvoice, status: PaymentStatus) {
		cart.addInvoice(invoice)

		const paymentRequestMessage: PaymentRequestMessage = {
			id: order.id,
			payment_id: selectedPaymentDetail!.id,
			type: 1,
			message: `Payment request for order ${order.id}, payment detail id: ${selectedPaymentDetail!.id}, type: ${selectedPaymentDetail!.paymentMethod}`,
			payment_options: [
				{
					type: selectedPaymentDetail!.paymentMethod,
					link: invoice.paymentRequest,
					paymentRequest: invoice.paymentRequest,
				},
			],
		}

		// Simulate sending DMs (commented out for now)
		await tick()
		await new Promise((resolve) => setTimeout(resolve, 1000))
		// await sendDM(paymentRequestMessage, order.sellerUserId)
		// await sendDM(invoice, order.sellerUserId)

		const newOrderStatus = statusMapping[status]
		if ($cart.orders[order.id].status !== newOrderStatus) {
			cart.updateOrderStatus(order.id, newOrderStatus)
			await new Promise((resolve) => setTimeout(resolve, 1000))
			// await sendDM($cart.orders[order.id], order.sellerUserId)
		}
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
			<PaymentProcessor
				paymentDetail={selectedPaymentDetail}
				amountSats={orderTotal.totalInSats}
				on:paymentComplete={handlePaymentEvent}
				on:paymentExpired={handlePaymentEvent}
				on:paymentCanceled={handlePaymentEvent}
			/>
		{/if}
	</div>
</div>
