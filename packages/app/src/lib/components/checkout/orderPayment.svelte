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
	type PaymentStatus = 'paid' | 'expired' | 'canceled'
	async function handlePaymentEvent(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>, status: PaymentStatus) {
		try {
			if (!order || !order.id) {
				throw new Error('Invalid order: Order or order ID is missing')
			}

			if (!selectedPaymentDetail || !selectedPaymentDetail.id) {
				throw new Error('Invalid payment details: Payment detail or ID is missing')
			}

			const paymentRequestMessage: PaymentRequestMessage = {
				id: order.id,
				payment_id: selectedPaymentDetail.id,
				type: 1,
				message: `Payment request for order ${order.id}, payment detail id: ${selectedPaymentDetail.id}, type: ${selectedPaymentDetail.paymentMethod}`,
				payment_options: [
					{
						type: selectedPaymentDetail.paymentMethod,
						link: event.detail.paymentRequest,
						paymentRequest: event.detail.paymentRequest,
					},
				],
			}

			const invoice: CartInvoice = {
				id: createId(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
				orderId: order.id,
				totalAmount: formatSats(orderTotal.totalInSats, false),
				invoiceStatus: status,
				paymentId: selectedPaymentDetail.id,
				paymentRequest: event.detail.paymentRequest,
				proof: event.detail.preimage,
			}

			try {
				cart.addInvoice(invoice)
			} catch (error) {
				console.error('Failed to add invoice to cart:', error)
				throw new Error('Failed to add invoice to cart')
			}

			// TODO: should we add a skiped status?
			const statusMapping: Record<PaymentStatus, OrderStatus> = {
				paid: ORDER_STATUS.PAID,
				expired: ORDER_STATUS.PENDING,
				canceled: ORDER_STATUS.PENDING,
			}

			const newOrderStatus = statusMapping[status] || ORDER_STATUS.PENDING

			try {
				// await sendDM(paymentRequestMessage, order.sellerUserId)
				await tick()
				await new Promise((resolve) => setTimeout(resolve, 1000))
				// await sendDM(invoice, order.sellerUserId)
				if ($cart.orders[order.id].status !== newOrderStatus) {
					cart.updateOrderStatus(order.id, newOrderStatus)
					await new Promise((resolve) => setTimeout(resolve, 1000))
					// await sendDM($cart.orders[order.id], order.sellerUserId)
				}
			} catch (error) {
				console.error('Failed to send payment request or invoice DM:', error)
				throw new Error('Failed to send payment request or invoice DM to seller')
			}

			dispatch('valid', true)
		} catch (e) {
			if (e instanceof Error) {
				toast.error(`Failed to process ${status} payment: ${e.message}`)
			}
			console.error(`Error handling ${status} payment:`, e)
			dispatch('valid', false)
		}
	}

	function handlePaymentComplete(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		handlePaymentEvent(event, 'paid')
	}

	function handlePaymentExpired(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		handlePaymentEvent(event, 'expired')
	}

	function handlePaymentCanceled(event: CustomEvent<{ paymentRequest: string; preimage: string | null }>) {
		handlePaymentEvent(event, 'canceled')
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
