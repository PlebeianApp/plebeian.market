<script lang="ts">
	import type { DisplayInvoice } from '$lib/server/invoices.service'
	import type { DisplayOrder } from '$lib/server/orders.service'
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { updateInvoiceStatusMutation } from '$lib/fetch/invoices.mutations'
	import { createInvoicesByFilterQuery } from '$lib/fetch/invoices.queries'
	import { updateOrderStatusMutation } from '$lib/fetch/order.mutations'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { editProductFromEventMutation, signProductStockMutation } from '$lib/fetch/products.mutations'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import ndkStore from '$lib/stores/ndk'
	import { createOrderStatusUpdateMessage, sendDM } from '$lib/utils/dm.utils'
	import { toast } from 'svelte-sonner'
	import { derived } from 'svelte/store'

	import type { InvoiceStatus } from '@plebeian/database/constants'

	import type { CheckoutPaymentEvent } from '../checkout/types'
	import type { OrderMode } from './types'
	import MiniUser from '../cart/mini-user.svelte'
	import CheckPaymentDetail from '../common/check-payment-detail.svelte'
	import InvoiceDisplay from '../common/invoice-display.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import ProductItem from '../product/product-item.svelte'
	import StallName from '../stalls/stall-name.svelte'
	import Button from '../ui/button/button.svelte'
	import InvoiceObservationsEdit from './invoice-observations-edit.svelte'
	import MiniShipping from './mini-shipping.svelte'
	import OrderActions from './order-actions.svelte'
	import V4vInvoiceRetry from './v4v-invoice-retry.svelte'

	export let order: DisplayOrder
	export let orderMode: OrderMode
	let currentPaymentDetail: RichPaymentDetail | undefined = undefined
	let merchantPaymentDetail: RichPaymentDetail | undefined = undefined

	let getUserProfileLoading: string | undefined = undefined
	const paymentDetails = createPaymentsForUserQuery(order.sellerUserId)
	$: relevantPaymentDetails = $paymentDetails.data?.filter((payment) => payment.stallId === order.stallId || payment.stallId === null) ?? []
	const v4vPaymentDetail: RichPaymentDetail = {
		id: 'v4v',
		paymentMethod: 'ln',
		isDefault: false,
		paymentDetails: '',
		stallId: order.stallId,
		stallName: '',
		userId: order.sellerUserId,
	}

	const paymentEventToStatus: Record<string, NonNullable<InvoiceStatus>> = {
		paymentComplete: 'paid',
		paymentExpired: 'expired',
		paymentCancelled: 'cancelled',
	}

	$: invoices = createInvoicesByFilterQuery({ orderId: order.id })

	const handleConfirmOrder = async (order: DisplayOrder): Promise<void> => {
		try {
			const allInvoicesPaid = $invoices.data?.every((i) => i.invoiceStatus === 'paid') ?? false
			const orderMutation = await $updateOrderStatusMutation.mutateAsync({
				orderId: order.id,
				status: 'confirmed',
			})
			if (!orderMutation) return
			await Promise.all(
				order.orderItems.map(async (orderItem) => {
					const product = $productQueryResults.find((q) => q.data?.id === orderItem.productId)?.data

					if (!product) {
						console.warn(`Product not found for order item: ${orderItem.productId}`)
						return
					}

					const newQuantity = allInvoicesPaid ? product.quantity : product.quantity - orderItem.qty

					const productEvent = await $signProductStockMutation.mutateAsync({
						product,
						newQuantity,
					})

					if (!productEvent) {
						console.warn(`Failed to sign product stock for: ${product.id}`)
						return
					}

					if (!allInvoicesPaid) {
						await $editProductFromEventMutation.mutateAsync(productEvent)
					}
				}),
			)
			order = {
				...order,
				status: 'confirmed',
			}
			const orderUpdateMessage = createOrderStatusUpdateMessage(order)
			await sendDM(orderUpdateMessage, order.buyerUserId)

			toast.success('Order confirmed')
		} catch (error) {
			console.error('Error confirming order:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to confirm order')
		}
	}

	const handleMarkAsShipped = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'shipped' })
		order = {
			...order,
			status: 'shipped',
		}
		const orderUpdateMessage = createOrderStatusUpdateMessage(order)
		await sendDM(orderUpdateMessage, order.buyerUserId)
		toast.success('Order marked as shipped')
	}

	const handleMarkAsReceived = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'completed' })
		order = {
			...order,
			status: 'completed',
		}
		const orderUpdateMessage = createOrderStatusUpdateMessage(order)
		await sendDM(orderUpdateMessage, order.sellerUserId)
		toast.success('Order marked as received')
	}

	const handleCancelOrder = async (order: DisplayOrder): Promise<void> => {
		try {
			await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'cancelled' })
			order = {
				...order,
				status: 'cancelled',
			}
			const orderUpdateMessage = createOrderStatusUpdateMessage(order)
			const recipientId = $ndkStore.activeUser?.pubkey === order.sellerUserId ? order.buyerUserId : order.sellerUserId
			await sendDM(orderUpdateMessage, recipientId)
			toast.success('Order cancelled')
		} catch (error) {
			console.error('Error cancelling order:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to cancel order')
		}
	}

	const handleRetryPayment = async (customEvent: CustomEvent<string>): Promise<void> => {
		getUserProfileLoading = customEvent.detail
		currentPaymentDetail = {
			...v4vPaymentDetail,
			paymentDetails: customEvent.detail,
		}
	}

	$: productQueries = order?.orderItems
		? order.orderItems.map((item) => {
				return createProductQuery(item.productId)
			})
		: []

	$: productQueryResults = derived(productQueries, ($queries) => $queries.map(($q) => $q))

	function handlePaymentEvent(event: CustomEvent<CheckoutPaymentEvent>, invoiceId: string) {
		const { type } = event
		const status = paymentEventToStatus[type]

		if (!status) {
			console.error(`Unknown payment event type: ${type}`)
			return
		}

		$updateInvoiceStatusMutation.mutateAsync({ invoiceId, status, preimage: event.detail.proof ?? '' })
		toast.success(`Payment ${status}`)
		currentPaymentDetail = undefined
		merchantPaymentDetail = undefined
	}

	const handleInvoiceUpdate = async (invoiceId: string, ce: CustomEvent<string>) => {
		await $updateInvoiceStatusMutation.mutateAsync({
			invoiceId,
			observations: ce.detail,
		})
		toast.success('Observations updated')
	}

	function shouldRetry(invoice: DisplayInvoice, orderMode: OrderMode): boolean {
		return (
			invoice.type === 'merchant' && orderMode === 'purchase' && invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'
		)
	}
</script>

<div class="mx-auto">
	<div class="bg-white rounded-lg shadow-sm p-4 md:p-6 space-y-6">
		<!-- Header Section -->
		<div>
			<div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
				<div>
					<h2 class="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
						{orderMode === 'sale' ? 'Sale Order' : 'Purchase Order'}
						<span class="text-sm font-normal text-gray-500">#{order.id}</span>
					</h2>
					<p class="text-sm text-gray-500 mt-1">
						Created {new Date(order.createdAt).toLocaleDateString()}
					</p>
				</div>
				<div>
					<span
						class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
			  {order.status === 'completed'
							? 'bg-green-100 text-green-800'
							: order.status === 'cancelled'
								? 'bg-red-100 text-red-800'
								: order.status === 'shipped'
									? 'bg-blue-100 text-blue-800'
									: 'bg-gray-100 text-gray-800'}"
					>
						{order.status}
					</span>
				</div>
			</div>
		</div>

		<!-- Order Info Section -->
		<div class="bg-gray-50 rounded-lg p-4">
			<div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
				<!-- Left Column: Order Details -->
				<div class="space-y-4">
					<div class="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-x-4 gap-y-2">
						<p class="text-gray-500">Last Update:</p>
						<p class="font-medium">{new Date(order.updatedAt).toLocaleDateString()}</p>

						{#if order.shippingId}
							<p class="text-gray-500">Shipping:</p>
							<div class="flex items-center">
								<MiniShipping shippingMethodId={order.shippingId} />
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: User and Stall -->
				<div class="lg:border-l lg:pl-6 min-w-[240px] space-y-4 lg:space-y-0">
					<!-- User Info -->
					<div class="mb-4">
						<p class="text-gray-500 mb-2 text-sm uppercase tracking-wider">
							{orderMode === 'sale' ? 'Buyer' : 'Seller'}
						</p>
						<div class="bg-white rounded p-2.5 border shadow-sm">
							<MiniUser userId={orderMode === 'sale' ? order.buyerUserId : order.sellerUserId} />
						</div>
					</div>

					<!-- Stall Info -->
					<div>
						<p class="text-gray-500 mb-2 text-sm uppercase tracking-wider">Stall</p>
						<div class="bg-white rounded p-2.5 border shadow-sm">
							<StallName stallId={order.stallId} />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions Section -->
		<div class="bg-gray-50 rounded-lg p-4">
			<p class="text-gray-500 mb-3 text-sm uppercase tracking-wider">Available Actions</p>
			<div class="overflow-x-auto">
				<OrderActions
					{orderMode}
					orderStatus={order.status}
					orderId={order.id}
					on:confirmOrder={() => handleConfirmOrder(order)}
					on:markAsShipped={() => handleMarkAsShipped(order)}
					on:markAsReceived={() => handleMarkAsReceived(order)}
					on:cancelOrder={() => handleCancelOrder(order)}
				/>
			</div>
		</div>

		<!-- Rest of the sections -->
		<div class="border-t pt-6">
			<div class="space-y-6">
				<!-- Shipping Details Section -->
				<section>
					<h3 class="font-medium text-lg mb-4">
						<span>Shipping Details</span>
					</h3>
					<div class="bg-gray-50 rounded-lg p-4">
						{#if order.address || order.zip || order.city || order.country || order.region}
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
								{#if order.address}
									<div>
										<p class="text-gray-500 text-sm">Address</p>
										<p class="font-medium">{order.address}</p>
									</div>
								{/if}
								{#if order.zip}
									<div>
										<p class="text-gray-500 text-sm">ZIP Code</p>
										<p class="font-medium">{order.zip}</p>
									</div>
								{/if}
								{#if order.city}
									<div>
										<p class="text-gray-500 text-sm">City</p>
										<p class="font-medium">{order.city}</p>
									</div>
								{/if}
								{#if order.country}
									<div>
										<p class="text-gray-500 text-sm">Country</p>
										<p class="font-medium">{order.country}</p>
									</div>
								{/if}
								{#if order.region}
									<div>
										<p class="text-gray-500 text-sm">Region</p>
										<p class="font-medium">{order.region}</p>
									</div>
								{/if}
							</div>
						{:else}
							<p class="text-gray-500 italic">No shipping details available</p>
						{/if}
					</div>
				</section>

				<!-- Contact Information Section -->
				<section>
					<h3 class="font-medium text-lg mb-4">
						<span>Contact Information</span>
					</h3>
					<div class="bg-gray-50 rounded-lg p-4">
						{#if order.contactName || order.contactPhone || order.contactEmail}
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
								{#if order.contactName}
									<div>
										<p class="text-gray-500 text-sm">Name</p>
										<p class="font-medium">{order.contactName}</p>
									</div>
								{/if}
								{#if order.contactPhone}
									<div>
										<p class="text-gray-500 text-sm">Phone</p>
										<p class="font-medium">{order.contactPhone}</p>
									</div>
								{/if}
								{#if order.contactEmail}
									<div>
										<p class="text-gray-500 text-sm">Email</p>
										<p class="font-medium">{order.contactEmail}</p>
									</div>
								{/if}
							</div>
						{:else}
							<p class="text-gray-500 italic">No contact information available</p>
						{/if}

						{#if order.additionalInfo?.trim()}
							<div class="mt-4 pt-4 border-t">
								<h4 class="text-gray-500 text-sm mb-1">Additional Information</h4>
								<p class="whitespace-pre-wrap">{order.additionalInfo}</p>
							</div>
						{/if}
					</div>
				</section>

				<!-- Products Section -->
				<section>
					<h3 class="font-medium text-lg mb-4">Products</h3>
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{#each $productQueryResults as query}
							{#if query.isLoading}
								<div class="animate-pulse bg-gray-100 rounded-lg h-32" />
							{:else if query.isError}
								<div class="text-red-500 p-4 rounded-lg border border-red-200 bg-red-50">
									<p class="font-medium">Error loading product</p>
									<p class="text-sm">{query.error.message}</p>
								</div>
							{:else if query.isSuccess && query.data}
								<ProductItem product={query.data} qtyPurchased={order.orderItems.find((oi) => oi.productId === query.data?.id)?.qty} />
							{:else}
								<div class="text-gray-500 italic p-4 rounded-lg border border-gray-200">No data available</div>
							{/if}
						{/each}
					</div>
				</section>

				<!-- Invoices Section -->
				{#if $invoices.data?.length}
					<section>
						<h3 class="font-medium text-lg mb-4">Invoices</h3>
						<div class="space-y-4">
							{#each $invoices.data as invoice (invoice.id)}
								<div class="flex flex-col p-4 bg-gray-50 rounded-lg shadow-sm gap-3">
									<InvoiceDisplay {invoice} />

									{#if shouldRetry(invoice, orderMode)}
										<div class="flex flex-col sm:flex-row sm:justify-end gap-2">
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													<Button variant="primary" class="w-full sm:w-32">Retry</Button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Content>
													<DropdownMenu.Group>
														{#if relevantPaymentDetails.length}
															{#each relevantPaymentDetails as paymentDetail}
																<DropdownMenu.Item on:click={() => (currentPaymentDetail = paymentDetail)}>
																	{paymentDetail.paymentMethod} - {paymentDetail.paymentDetails}
																</DropdownMenu.Item>
															{/each}
														{:else}
															No related payment details
														{/if}
													</DropdownMenu.Group>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</div>
									{/if}

									{#if currentPaymentDetail}
										<PaymentProcessor
											paymentDetail={currentPaymentDetail}
											amountSats={parseInt(invoice.totalAmount)}
											paymentType="v4v"
											on:paymentComplete={(e) => handlePaymentEvent(e, invoice.id)}
											on:paymentExpired={(e) => handlePaymentEvent(e, invoice.id)}
											on:paymentCancelled={(e) => handlePaymentEvent(e, invoice.id)}
										/>
									{/if}

									{#if invoice.type === 'v4v'}
										{#if orderMode === 'purchase'}
											<V4vInvoiceRetry {invoice} on:retryPayment={handleRetryPayment} />
											{#if currentPaymentDetail && currentPaymentDetail.paymentDetails === invoice.paymentDetails}
												<PaymentProcessor
													paymentDetail={currentPaymentDetail}
													amountSats={parseInt(invoice.totalAmount)}
													paymentType="v4v"
													on:paymentComplete={(e) => handlePaymentEvent(e, invoice.id)}
													on:paymentExpired={(e) => handlePaymentEvent(e, invoice.id)}
													on:paymentCancelled={(e) => handlePaymentEvent(e, invoice.id)}
												/>
											{/if}
										{:else if invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'}
											<div class="p-2 flex justify-between items-center gap-2">
												<CheckPaymentDetail paymentDetails={invoice.paymentDetails} />
											</div>
										{/if}
									{/if}
									{#if order.additionalInfo?.trim()}
										<InvoiceObservationsEdit
											observations={invoice.observations ?? ''}
											on:update={(ce) => handleInvoiceUpdate(invoice.id, ce)}
											{orderMode}
										/>
									{/if}
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		</div>
	</div>
</div>
