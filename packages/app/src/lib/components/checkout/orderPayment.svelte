<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js'
	import type { V4VDTO } from '$lib/fetch/v4v.queries'
	import type { OrderFilter } from '$lib/schema'
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import type { CartProduct, CartStall } from '$lib/stores/cart'
	import * as Carousel from '$lib/components/ui/carousel/index.js'
	import * as Select from '$lib/components/ui/select'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats, resolveQuery } from '$lib/utils'
	import { sendDM } from '$lib/utils/dm.utils'
	import { createEventDispatcher, onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { InvoiceMessage, OrderStatus, PaymentRequestMessage } from '@plebeian/database/constants'
	import { ORDER_STATUS } from '@plebeian/database/constants'
	import { createSlugId } from '@plebeian/database/utils'

	import type { InvoicePaymentStatus, OrderPaymentStatus } from '../order/types'
	import type { CheckoutPaymentEvent } from './types'
	import MiniStall from '../cart/mini-stall.svelte'
	import ProductInCart from '../cart/product-in-cart.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniV4v from '../v4v/mini-v4v.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>

	const dispatch = createEventDispatcher<{ valid: boolean }>()

	type ShareWithInvoice = V4VDTO & { canReceive: boolean; max: number; min: number; paymentDetail: RichPaymentDetail }

	// TODO: Maybe we can fetch invoices at the moment of render it. Right now they all starts at the same time which can lead to end expiry times
	let api: CarouselAPI
	let carouselCount = 0
	let carouselCurrent = 0
	let paymentStatuses: { id: string; status: OrderPaymentStatus }[] = []
	let paymentInvoices: Record<string, string> = {}
	let orderTotal: Awaited<ReturnType<typeof cart.calculateStallTotal>>
	let v4vShares: ShareWithInvoice[] = []
	let v4vTotalPercentage: number | null = null

	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	const v4vQuery = v4VForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null
	$: selectedPaymentValue = selectedPaymentDetail && {
		label: `${selectedPaymentDetail.paymentMethod} - ${selectedPaymentDetail.paymentDetails}`,
		value: selectedPaymentDetail,
	}

	$: allPaymentsPaid =
		paymentStatuses.length > 0 && paymentStatuses.every((status) => ['paid', 'expired', 'cancelled'].includes(status.status ?? ''))

	$: {
		if (allPaymentsPaid) {
			dispatch('valid', true)
		}
	}

	$: {
		if (api) {
			carouselCount = api.scrollSnapList().length
			carouselCurrent = api.selectedScrollSnap() + 1
			api.on('select', () => {
				carouselCurrent = api.selectedScrollSnap() + 1
			})
		}
	}

	const v4vPaymentDetail: RichPaymentDetail = {
		id: 'v4v',
		paymentMethod: 'ln',
		isDefault: false,
		paymentDetails: '',
		stallId: order.stallId,
		stallName: '',
		userId: order.sellerUserId,
	}

	onMount(async () => {
		if (!$v4vQuery.data) return
		const results = await Promise.all(
			$v4vQuery.data.map(async (v4v) => {
				const user = $ndkStore.getUser({ npub: v4v.target })
				const userProfile = await resolveQuery(() => createUserByIdQuery(user.pubkey))
				return {
					...v4v,
					paymentDetail: {
						...v4vPaymentDetail,
						paymentDetails: userProfile?.lud16,
					},
				} as ShareWithInvoice
			}),
		)

		v4vShares = results
		v4vTotalPercentage = results.reduce((sum, item) => sum + item.amount, 0)
		await initializePaymentStatuses()
	})

	async function initializePaymentStatuses() {
		await tick()
		paymentStatuses = [{ id: 'merchant', status: null }, ...v4vShares.map((share) => ({ id: share.target, status: null }))]

		if (orderTotal) {
			const merchantInvoice = createInvoice(
				null,
				null,
				'pending',
				orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)) + orderTotal.shippingInSats,
				'merchant',
			)
			processPayment(merchantInvoice, 'pending')

			for (const share of v4vShares) {
				const v4vInvoice = createInvoice(null, null, 'pending', orderTotal.subtotalInSats * share.amount, share.target)
				processPayment(v4vInvoice, 'pending')
			}
		}
	}

	const paymentEventToStatus: Record<string, NonNullable<OrderPaymentStatus>> = {
		paymentComplete: 'paid',
		paymentExpired: 'expired',
		paymentCancelled: 'cancelled',
	}

	function moveToNextPaymentProcessor() {
		if (api) {
			const nextIndex = api.selectedScrollSnap() + 1
			if (nextIndex < carouselCount) {
				api.scrollTo(nextIndex)
			} else {
				api.scrollTo(0)
			}
		}
	}

	function handlePaymentEvent(event: CustomEvent<CheckoutPaymentEvent>) {
		const { type } = event
		const { paymentRequest, proof, amountSats, paymentType } = event.detail

		const status = paymentEventToStatus[type]
		if (!status) {
			console.error(`Unknown payment event type: ${type}`)
			return
		}

		if (!order?.id || !selectedPaymentDetail?.id) {
			toast.error(`Invalid order or payment details`)
			return
		}

		try {
			if (paymentInvoices[paymentType]) {
				const existingInvoice = $cart.invoices[paymentInvoices[paymentType]]
				if (existingInvoice) {
					existingInvoice.invoiceStatus = status
					existingInvoice.updatedAt = Date.now()
					if (proof) existingInvoice.proof = proof
					if (paymentRequest) existingInvoice.paymentRequest = paymentRequest
					cart.updateInvoice(existingInvoice)
				}
			} else {
				const invoice = createInvoice(paymentRequest, proof, status, amountSats, paymentType)
				processPayment(invoice, status)
			}

			paymentStatuses = paymentStatuses.map((s) => (s.id === paymentType ? { ...s, status } : s))
			moveToNextPaymentProcessor()
		} catch (error) {
			console.error(`Error handling ${status} payment:`, error)
			toast.error(`Failed to process ${status} payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	function createInvoice(
		paymentRequest: string | null,
		preimage: string | null,
		status: NonNullable<InvoicePaymentStatus>,
		amount: number,
		paymentType: string,
	): InvoiceMessage {
		const invoice = {
			id: createSlugId(`inv`),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id,
			totalAmount: formatSats(amount, false),
			type: paymentType === 'merchant' ? 'merchant' : 'v4v',
			invoiceStatus: status,
			paymentId: paymentType === 'merchant' ? selectedPaymentDetail?.id : paymentType,
			paymentRequest: paymentRequest,
			proof: preimage,
		}
		paymentInvoices[paymentType] = invoice.id
		return invoice
	}

	async function processPayment(invoice: InvoiceMessage, status: NonNullable<InvoicePaymentStatus>) {
		cart.addInvoice(invoice)

		const paymentRequestMessage: PaymentRequestMessage = {
			id: order.id,
			payment_id: invoice.paymentId,
			type: 1,
			message: `Payment request for order ${order.id}, payment detail id: ${invoice.paymentId}`,
			payment_options: [
				{
					type: selectedPaymentDetail!.paymentMethod,
					link: invoice.paymentRequest,
					paymentRequest: invoice.paymentRequest,
				},
			],
		}

		// Simulate sending DMs (commented out for now)
		await new Promise((resolve) => setTimeout(resolve, 1000))
		// await sendDM(paymentRequestMessage, order.sellerUserId)
		// await sendDM(invoice, order.sellerUserId)

		// const newOrderStatus = statusMapping[status]
		// if ($cart.orders[order.id].status !== newOrderStatus) {
		// 	cart.updateOrderStatus(order.id, newOrderStatus)
		// 	await new Promise((resolve) => setTimeout(resolve, 1000))
		// 	// await sendDM($cart.orders[order.id], order.sellerUserId)
		// }
	}
	$: {
		order
		cart.calculateStallTotal(stall, products).then((total) => (orderTotal = total))
	}
</script>

<div class="flex flex-row gap-8">
	<div class="w-1/2 flex flex-col gap-4">
		<MiniStall stallCoordinate={order.stallId} mode="view" />
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
						class="flex justify-between font-bold border-black items-center border p-2 hover:bg-gray-100"
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
						{#if !paymentStatuses.find((status) => status.id === 'merchant')?.status}
							<span class="i-mdi-timer-sand text-black w-6 h-6 animate-pulse"> </span>
						{/if}
					</div>
					{#each v4vShares as share, index}
						{@const status = paymentStatuses.find((status) => status.id === share.target)?.status}
						<div
							class:border-l-8={carouselCurrent === index + 2}
							class="border-black border hover:bg-gray-100 flex items-center justify-between p-2"
							role="button"
							tabindex="0"
							on:click={() => api?.scrollTo(index + 1)}
							on:keydown={(e) => e.key === 'Enter' && api?.scrollTo(index + 1)}
						>
							<MiniV4v npub={share.target} percentage={share.amount} amountSats={orderTotal.subtotalInSats * share.amount} />

							{#if !status}
								<span class="i-mdi-timer-sand text-black w-6 h-6 animate-pulse"> </span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	<div class="w-1/2 mt-4 flex flex-col items-center gap-4">
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
				<Carousel.Root class="h-full w-[80%]" bind:api>
					<Carousel.Content>
						<Carousel.Item>
							<div class="p-1">
								<PaymentProcessor
									paymentDetail={selectedPaymentDetail}
									amountSats={orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)) + orderTotal.shippingInSats}
									paymentType="merchant"
									on:paymentComplete={handlePaymentEvent}
									on:paymentExpired={handlePaymentEvent}
									on:paymentCancelled={handlePaymentEvent}
								/>
							</div>
						</Carousel.Item>
						<!-- FIXME: there is an error sometimes when there are multiple v4v shares, it can jump and also generate non existent v4v shares invoices -->
						{#each v4vShares as share (share.target)}
							<Carousel.Item>
								<div class="p-1">
									<PaymentProcessor
										paymentDetail={share.paymentDetail}
										amountSats={orderTotal.subtotalInSats * share.amount}
										paymentType={share.target}
										on:paymentComplete={handlePaymentEvent}
										on:paymentExpired={handlePaymentEvent}
										on:paymentCancelled={handlePaymentEvent}
									/>
								</div>
							</Carousel.Item>
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
				paymentType="merchant"
				on:paymentComplete={handlePaymentEvent}
				on:paymentExpired={handlePaymentEvent}
				on:paymentCancelled={handlePaymentEvent}
			/>
		{/if}
	</div>
</div>
