<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js'
	import type { V4VDTO } from '$lib/fetch/v4v.queries'
	import type { OrderFilter } from '$lib/schema'
	import type { CartProduct, CartStall, InvoiceMessage } from '$lib/stores/cart'
	import * as Carousel from '$lib/components/ui/carousel/index.js'
	import * as Select from '$lib/components/ui/select'
	import { createInvoiceMutation } from '$lib/fetch/invoices.mutations'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import ndkStore from '$lib/stores/ndk'
	import { checkTargetUserHasLightningAddress, decodePk, formatSats } from '$lib/utils'
	import { createEventDispatcher, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { OrderStatus, PaymentRequestMessage } from '@plebeian/database/constants'
	import { ORDER_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import ProductInCart from '../cart/product-in-cart.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniV4v from '../v4v/mini-v4v.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	let api: CarouselAPI

	let carouselCount = 0
	let carouselCurrent = 0

	$: if (api) {
		carouselCount = api.scrollSnapList().length
		carouselCurrent = api.selectedScrollSnap() + 1
		api.on('select', () => {
			carouselCurrent = api.selectedScrollSnap() + 1
		})
	}

	const dispatch = createEventDispatcher<{ valid: boolean }>()

	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null

	$: selectedPaymentValue = selectedPaymentDetail && {
		label: `${selectedPaymentDetail.paymentMethod} - ${selectedPaymentDetail.paymentDetails}`,
		value: selectedPaymentDetail,
	}

	let orderTotal: Awaited<ReturnType<typeof cart.calculateStallTotal>>

	type ShareWithInvoice = V4VDTO & { invoice: string; canReceive: boolean; max: number; min: number }

	let v4vShares: ShareWithInvoice[] = []
	let v4vTotalPercentage: number | null = null

	$: v4vQuery = v4VForUserQuery(order.sellerUserId)
	$: if ($v4vQuery.data) {
		Promise.all(
			$v4vQuery.data.map(async (v4v) => {
				const res = await checkTargetUserHasLightningAddress(decodePk(v4v.target))
				console.log('res', res)
				const canBeZappedRes = res.filter((method) => {
					const amount = v4v.amount * orderTotal.subtotalInSats
					const max = method.data.maxSendable / 1000
					const min = method.data.minSendable / 1000
					const canReceive = amount >= min && amount <= max
					return canReceive
				})

				console.log('canBeZappedRes', canBeZappedRes)

				const user = $ndkStore.getUser({ npub: v4v.target })
				const zapRes = canBeZappedRes.length > 0 ? await user.zap(v4v.amount * 1000) : ''

				if (typeof zapRes !== 'string') {
					return { ...v4v, invoice: '' } as ShareWithInvoice
				}

				return { ...v4v, invoice: zapRes } as ShareWithInvoice
			}),
		).then((results) => {
			v4vShares = results
		})
	}

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

	async function handlePaymentEvent(
		event: CustomEvent<{ paymentRequest: string; preimage: string | null; amount: number; isV4V?: boolean }>,
	) {
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
			const invoice = createInvoice(event.detail, status, event.detail.amount, event.detail.isV4V)
			await processPayment(invoice, status)
			dispatch('valid', true)
		} catch (error) {
			console.error(`Error handling ${status} payment:`, error)
			toast.error(`Failed to process ${status} payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
			dispatch('valid', false)
		}
	}

	function createInvoice(
		detail: { paymentRequest: string; preimage: string | null },
		status: PaymentStatus,
		amount: number,
		isV4V: boolean = false,
	): InvoiceMessage {
		return {
			id: createId(),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id,
			totalAmount: formatSats(amount, false),
			type: isV4V ? 'v4v' : 'merchant',
			invoiceStatus: status,
			paymentId: selectedPaymentDetail!.id,
			paymentRequest: detail.paymentRequest,
			proof: detail.preimage,
		}
	}

	async function processPayment(invoice: InvoiceMessage, status: PaymentStatus) {
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

		// TODO: are we creating the invoices here?

		// await $createInvoiceMutation.mutate(invoice)

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

			{#if v4vShares.length > 0}
				<Separator />
				<div class="flex flex-col gap-2">
					<h3 class="font-semibold">Shares:</h3>
					<div
						class="flex justify-between font-bold border-black border p-2 hover:bg-gray-100"
						class:border-l-8={carouselCurrent === 1}
						role="button"
						tabindex="0"
						on:click={() => api?.scrollTo(0)}
						on:keydown={(e) => e.key === 'Enter' && api?.scrollTo(0)}
					>
						<span>Merchant's share:</span>
						<div class="flex flex-col justify-end">
							<small class="text-right">
								{formatSats(orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)))} sats ({(1 - (v4vTotalPercentage ?? 0)) * 100}% of
								subtotal)</small
							>
							<small class="text-right"> + {formatSats(orderTotal.shippingInSats)} sats shipping</small>
							<span class="text-right"
								>{formatSats(
									orderTotal.subtotalInSats * (1 - v4vShares.reduce((sum, share) => sum + share.amount, 0)) + orderTotal.shippingInSats,
								)} sats</span
							>
						</div>
					</div>
					{#each v4vShares as share, index}
						{#if share.invoice}
							<div
								class:border-l-8={carouselCurrent === index + 1}
								class="border-black border hover:bg-gray-100"
								role="button"
								tabindex="0"
								on:click={() => api?.scrollTo(index + 1)}
								on:keydown={(e) => e.key === 'Enter' && api?.scrollTo(index + 1)}
							>
								<MiniV4v npub={share.target} percentage={share.amount} amountSats={orderTotal.subtotalInSats * share.amount} />
							</div>
						{:else}
							<div class="border-black border" data-tooltip="This v4 recipient cant be zapped.">
								<MiniV4v npub={share.target} percentage={share.amount} amountSats={orderTotal.subtotalInSats * share.amount} />
							</div>{/if}
					{/each}
				</div>
			{/if}
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

		{#if v4vShares.length > 0}
			{#if selectedPaymentDetail && orderTotal}
				<Carousel.Root class="w-ful w-[80%]  h-60" bind:api>
					<Carousel.Content>
						<Carousel.Item>
							<div class="p-1">
								<PaymentProcessor
									paymentDetail={selectedPaymentDetail}
									amountSats={orderTotal.totalInSats}
									on:paymentComplete={handlePaymentEvent}
									on:paymentExpired={handlePaymentEvent}
									on:paymentCanceled={handlePaymentEvent}
								/>
							</div>
						</Carousel.Item>

						{#each v4vShares as share}
							{#if share.invoice}
								<Carousel.Item>
									<div class="p-1">
										<PaymentProcessor
											paymentDetail={{
												id: 'v4v',
												paymentMethod: 'ln',
												isDefault: false,
												paymentDetails: share.invoice,
												stallId: order.stallId,
												stallName: '',
												userId: order.sellerUserId,
											}}
											amountSats={orderTotal.subtotalInSats * share.amount}
											on:paymentComplete={handlePaymentEvent}
											on:paymentExpired={handlePaymentEvent}
											on:paymentCanceled={handlePaymentEvent}
										/>
									</div>
								</Carousel.Item>
							{/if}
						{/each}
					</Carousel.Content>
					<Carousel.Previous />
					<Carousel.Next />
				</Carousel.Root>
			{/if}
		{:else if selectedPaymentDetail && orderTotal}
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
