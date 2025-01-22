<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js'
	import type { V4VDTO } from '$lib/fetch/v4v.queries'
	import type { OrderFilter } from '$lib/schema'
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import type { CartProduct, CartStall } from '$lib/stores/cart'
	import * as Button from '$lib/components/ui/button'
	import * as Carousel from '$lib/components/ui/carousel/index.js'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import ndkStore from '$lib/stores/ndk'
	import { canPayWithNWC } from '$lib/stores/nwc'
	import { cn, formatSats, resolveQuery } from '$lib/utils'
	import { createPaymentRequestMessage, sendDM } from '$lib/utils/dm.utils'
	import { paymentMethodIcons } from '$lib/utils/paymentDetails.utils'
	import { createEventDispatcher, onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { InvoiceMessage, InvoiceStatus } from '@plebeian/database/constants'
	import { createSlugId } from '@plebeian/database/utils'

	import type { CheckoutPaymentEvent } from './types'
	import MiniStall from '../cart/mini-stall.svelte'
	import ProductInCart from '../cart/product-in-cart.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniV4v from '../v4v/mini-v4v.svelte'

	export let order: OrderFilter
	export let stall: CartStall
	export let products: Record<string, CartProduct>
	let paymentProcessors: PaymentProcessor[] = []

	const dispatch = createEventDispatcher<{ valid: boolean }>()
	type ShareWithInvoice = V4VDTO & {
		canReceive: boolean
		max: number
		min: number
		paymentDetail: RichPaymentDetail
	}

	let api: CarouselAPI
	let carouselCount = 0
	let carouselCurrent = 0

	let paymentStatuses: { id: string; status: InvoiceStatus }[] = []
	let paymentInvoices: Record<string, string> = {}
	let orderTotal: Awaited<ReturnType<typeof cart.calculateStallTotal>>
	let v4vShares: ShareWithInvoice[] = []
	let v4vTotalPercentage: number | null = null
	let somePaymentsAllowNWC = false

	$: canUseNWC = orderTotal?.totalInSats && canPayWithNWC(orderTotal?.totalInSats)
	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	const v4vQuery = v4VForUserQuery(order.sellerUserId)

	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	$: selectedPaymentDetail = relevantPaymentDetails[0] ?? null

	$: allPaymentsPaid =
		paymentStatuses.length > 0 && paymentStatuses.every((status) => ['paid', 'expired', 'cancelled'].includes(status.status ?? ''))

	$: if (allPaymentsPaid) dispatch('valid', true)

	$: if (api) {
		carouselCount = api.scrollSnapList().length
		carouselCurrent = api.selectedScrollSnap() + 1
		api.on('select', () => {
			carouselCurrent = api.selectedScrollSnap() + 1
		})
	}

	const paymentEventToStatus: Record<string, NonNullable<InvoiceStatus>> = {
		paymentComplete: 'paid',
		paymentExpired: 'expired',
		paymentCancelled: 'cancelled',
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

	function filterValidV4VShares(shares: ShareWithInvoice[], subtotalInSats: number) {
		return shares.filter((share) => {
			const amount = formatSats(subtotalInSats * share.amount, false)
			return amount > 0
		})
	}
	onMount(async () => {
		if (!$v4vQuery.data) return
		await initializeV4VShares()
		await initializePaymentStatuses()
	})

	async function initializeV4VShares() {
		const results = await Promise.all(
			$v4vQuery.data!.map(async (v4v) => {
				const user = $ndkStore.getUser({ npub: v4v.target })
				const userProfile = await resolveQuery(() => createUserByIdQuery(user.pubkey))

				somePaymentsAllowNWC = somePaymentsAllowNWC || Boolean(userProfile?.lud16)

				return {
					...v4v,
					paymentDetail: {
						...v4vPaymentDetail,
						paymentDetails: userProfile?.lud16,
					},
				} as ShareWithInvoice
			}),
		)
		v4vShares = orderTotal ? filterValidV4VShares(results, orderTotal.subtotalInSats) : results
		v4vTotalPercentage = v4vShares.reduce((sum, item) => sum + item.amount, 0)
	}

	async function initializePaymentStatuses() {
		await tick()
		paymentStatuses = [{ id: 'merchant', status: null }, ...v4vShares.map((share) => ({ id: share.target, status: null }))]

		if (!orderTotal) return

		const merchantAmount = orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)) + orderTotal.shippingInSats
		const merchantInvoice = createInvoice(null, null, 'pending', merchantAmount, 'merchant')
		cart.addInvoice(merchantInvoice)

		for (const share of v4vShares) {
			const v4vAmount = orderTotal.subtotalInSats * share.amount
			const v4vInvoice = createInvoice(null, null, 'pending', v4vAmount, share.target)
			cart.addInvoice(v4vInvoice)
		}
	}

	function createInvoice(
		paymentRequest: string | null,
		preimage: string | null,
		status: NonNullable<InvoiceStatus>,
		amount: number,
		paymentType: string,
	): InvoiceMessage {
		const invoice = {
			id: createSlugId(`inv`),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			orderId: order.id,
			totalAmount: formatSats(amount, false),
			type: (paymentType === 'merchant' ? 'merchant' : 'v4v') as 'v4v' | 'merchant',
			invoiceStatus: status,
			paymentId: paymentType === 'merchant' ? selectedPaymentDetail?.id : paymentType,
			paymentRequest,
			proof: preimage,
		}
		paymentInvoices[paymentType] = invoice.id
		return invoice
	}

	function moveToNextPaymentProcessor() {
		if (!api) return
		const nextIndex = api.selectedScrollSnap() + 1
		if (nextIndex < carouselCount) {
			api.scrollTo(nextIndex)
		} else {
			api.scrollTo(0)
		}
	}

	function handlePaymentEvent(event: CustomEvent<CheckoutPaymentEvent>) {
		const { type } = event
		const { paymentRequest, proof, amountSats, paymentType } = event.detail

		const status = paymentEventToStatus[type]
		if (!status || !order?.id || !selectedPaymentDetail?.id) {
			toast.error(`Invalid order or payment details`)
			return
		}

		try {
			if (paymentInvoices[paymentType]) {
				updateExistingInvoice(paymentType, status, proof ? proof : undefined, paymentRequest ? paymentRequest : undefined)
			} else {
				const invoice = createInvoice(paymentRequest, proof, status, amountSats, paymentType)
				cart.addInvoice(invoice)
			}

			paymentStatuses = paymentStatuses.map((s) => (s.id === paymentType ? { ...s, status } : s))
			moveToNextPaymentProcessor()
		} catch (error) {
			console.error(`Error handling ${status} payment:`, error)
			toast.error(`Failed to process ${status} payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	async function updateExistingInvoice(paymentType: string, status: NonNullable<InvoiceStatus>, proof?: string, paymentRequest?: string) {
		const existingInvoice = $cart.invoices[paymentInvoices[paymentType]]
		if (!existingInvoice) return

		existingInvoice.invoiceStatus = status
		existingInvoice.updatedAt = Date.now()
		if (proof) existingInvoice.proof = proof
		if (paymentRequest) existingInvoice.paymentRequest = paymentRequest
		cart.updateInvoice(existingInvoice)

		// Send Invoice DMs
		const paymentRequestMessage = createPaymentRequestMessage(existingInvoice, order, selectedPaymentDetail)
		await sendDM(paymentRequestMessage, order.sellerUserId)
		await new Promise((resolve) => setTimeout(resolve, 1000))
		await sendDM(existingInvoice, order.sellerUserId)
	}

	$: {
		order
		cart.calculateStallTotal(stall, products).then((total) => (orderTotal = total))
	}
	function handleSelection(paymentDetail: (typeof relevantPaymentDetails)[number]) {
		selectedPaymentDetail = paymentDetail
	}

	async function handlePayAllNWCInvoices() {
		for (const processor of paymentProcessors) {
			if (processor) {
				await processor.triggerNWCPayment()
			}
		}
	}
</script>

<div class="grid md:grid-cols-2 gap-4 md:gap-8 max-w-full overflow-hidden">
	<div class="flex flex-col gap-4 min-w-0">
		<MiniStall stallCoordinate={order.stallId} mode="view" />
		<div class="flex flex-col gap-2 overflow-auto">
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
				<div class="flex flex-col gap-2 overflow-x-hidden">
					<h3 class="font-semibold">Shares:</h3>
					<div
						class="flex flex-col sm:flex-row gap-2 font-bold border-black border p-2.5 hover:bg-gray-100 overflow-hidden"
						class:border-l-8={carouselCurrent === 1}
						role="button"
						tabindex="0"
						on:click={() => api?.scrollTo(0)}
						on:keydown={(e) => e.key === 'Enter' && api?.scrollTo(0)}
					>
						<div class="flex items-center gap-1.5 text-gray-700">
							<CAvatar pubkey={order.sellerUserId} profile={null} linked={false} />

							<span>Merchant's share</span>
							{#if !paymentStatuses.find((status) => status.id === 'merchant')?.status}
								<span class="i-mdi-timer-sand w-4 h-4 animate-pulse flex-shrink-0" />
							{/if}
						</div>

						<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:ml-auto items-center">
							<div class="flex items-center gap-1">
								<span class="">{(1 - (v4vTotalPercentage ?? 0)) * 100}% subtotal:</span>
								<span class=" font-medium">
									{formatSats(orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)))}
								</span>
							</div>

							<div class="flex items-center gap-1">
								<span>shipping:</span>
								<span class="font-medium text-black">
									{formatSats(orderTotal.shippingInSats)}
								</span>
							</div>

							<div class="flex items-center gap-1 sm:border-l sm:pl-3">
								<span class="font-medium">
									{formatSats(
										orderTotal.subtotalInSats * (1 - v4vShares.reduce((sum, share) => sum + share.amount, 0)) + orderTotal.shippingInSats,
									)} sats
								</span>
							</div>
						</div>
					</div>

					{#each v4vShares as share, index}
						{@const status = paymentStatuses.find((status) => status.id === share.target)?.status}
						<div
							class:border-l-8={carouselCurrent === index + 2}
							class="flex flex-col sm:flex-row gap-2 font-bold border-black border p-2.5 hover:bg-gray-100 overflow-hidden"
							role="button"
							tabindex="0"
							on:click={() => api?.scrollTo(index + 1)}
							on:keydown={(e) => e.key === 'Enter' && api?.scrollTo(index + 1)}
						>
							<div class="min-w-0 flex-1">
								<MiniV4v npub={share.target} percentage={share.amount} amountSats={orderTotal.subtotalInSats * share.amount}>
									{#if !status}
										<span class="i-mdi-timer-sand w-4 h-4 animate-pulse flex-shrink-0" />
									{/if}
								</MiniV4v>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
	<!---->
	<div class="flex flex-col items-center gap-4 min-w-0">
		<div class="flex flex-wrap justify-center gap-2 w-full px-2">
			{#each relevantPaymentDetails as paymentDetail}
				<Button.Root
					variant="outline"
					class={cn(
						'flex items-center justify-center px-3 md:px-4 py-2',
						'transition-all duration-200 hover:border-primary',
						'text-sm md:text-base',
						selectedPaymentDetail?.paymentMethod === paymentDetail.paymentMethod
							? 'border-2 border-primary bg-primary/5'
							: 'border hover:bg-accent/50',
					)}
					on:click={() => handleSelection(paymentDetail)}
				>
					<div class="flex items-center gap-1 md:gap-2">
						<span class={paymentMethodIcons[paymentDetail.paymentMethod] + ' w-4 h-4 md:w-5 md:h-5'} />
						{paymentDetail.paymentMethod}
					</div>
				</Button.Root>
			{/each}
		</div>

		{#if v4vShares.length > 0}
			{#if selectedPaymentDetail && orderTotal}
				<div class="w-full px-2 md:px-4">
					<Carousel.Root class="h-full w-full" bind:api>
						<Carousel.Content>
							<Carousel.Item>
								<div class="p-1">
									<PaymentProcessor
										bind:this={paymentProcessors[0]}
										paymentDetail={selectedPaymentDetail}
										amountSats={orderTotal.subtotalInSats * (1 - (v4vTotalPercentage ?? 0)) + orderTotal.shippingInSats}
										paymentType="merchant"
										on:paymentComplete={handlePaymentEvent}
										on:paymentExpired={handlePaymentEvent}
										on:paymentCancelled={handlePaymentEvent}
									/>
								</div>
							</Carousel.Item>
							{#each v4vShares as share, index (share.target)}
								<Carousel.Item>
									<div class="p-1">
										<PaymentProcessor
											bind:this={paymentProcessors[index + 1]}
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
				</div>
			{/if}
		{:else if selectedPaymentDetail && orderTotal}
			<div class="w-full px-2 md:px-4">
				<PaymentProcessor
					bind:this={paymentProcessors[0]}
					paymentDetail={selectedPaymentDetail}
					amountSats={orderTotal.totalInSats}
					paymentType="merchant"
					on:paymentComplete={handlePaymentEvent}
					on:paymentExpired={handlePaymentEvent}
					on:paymentCancelled={handlePaymentEvent}
				/>
			</div>
		{/if}
		{#if somePaymentsAllowNWC && canUseNWC}
			<Button.Root class="w-[90%] md:w-1/2" on:click={() => handlePayAllNWCInvoices()}>
				<span>Pay all NWC invoices</span> <span class="i-mdi-purse w-5 h-5 ml-2" />
			</Button.Root>
		{/if}
	</div>
</div>
