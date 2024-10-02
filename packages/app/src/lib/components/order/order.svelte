<script lang="ts">
	import type { DisplayOrder } from '$lib/server/orders.service'
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { updateInvoiceStatusMutation } from '$lib/fetch/invoices.mutations'
	import { createInvoicesByFilterQuery } from '$lib/fetch/invoices.queries'
	import { updateOrderStatusMutation } from '$lib/fetch/order.mutations'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { formatSats, getInvoiceStatusColor } from '$lib/utils'
	import { toast } from 'svelte-sonner'
	import { derived } from 'svelte/store'

	import type { CheckoutPaymentEvent } from '../checkout/types'
	import MiniUser from '../cart/mini-user.svelte'
	import CheckPaymentDetail from '../common/check-payment-detail.svelte'
	import PaymentProcessor from '../paymentProcessors/paymentProcessor.svelte'
	import ProductItem from '../product/product-item.svelte'
	import StallName from '../stalls/stall-name.svelte'
	import Button from '../ui/button/button.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniShipping from './mini-shipping.svelte'
	import OrderActions from './order-actions.svelte'

	export let order: DisplayOrder
	export let orderMode: 'sale' | 'purchase'
	let currentPaymentDetail: RichPaymentDetail | undefined = undefined
	let merchantPaymentDetail: RichPaymentDetail | undefined = undefined

	// TODO: We are repeating this type from the checkout, should be the same an be imported
	type PaymentStatus = 'paid' | 'expired' | 'canceled' | null

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

	const paymentEventToStatus: Record<string, NonNullable<PaymentStatus>> = {
		paymentComplete: 'paid',
		paymentExpired: 'expired',
		paymentCanceled: 'canceled',
	}

	$: invoices = createInvoicesByFilterQuery({ orderId: order.id })

	const handleConfirmOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'confirmed' })
		toast.success('Order confirmed')
	}

	const handleMarkAsShipped = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'shipped' })
		toast.success('Order marked as shipped')
	}

	const handleMarkAsReceived = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'completed' })
		toast.success('Order marked as received')
	}

	const handleCancelOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: 'canceled' })
		toast.success('Order cancelled')
	}

	const handleRetryPayment = async (paymentDetails: string): Promise<void> => {
		getUserProfileLoading = paymentDetails
		currentPaymentDetail = {
			...v4vPaymentDetail,
			paymentDetails,
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

		$updateInvoiceStatusMutation.mutateAsync({ invoiceId, status, preimage: event.detail.preimage ?? '' })
		toast.success(`Payment ${status}`)
		currentPaymentDetail = undefined
		merchantPaymentDetail = undefined
	}
</script>

<div>
	<h2 class="text-2xl font-bold mb-4">{orderMode === 'sale' ? 'Sale Order' : 'Purchase Order'}</h2>
	<div class="flex flex-col">
		<div class="flex flex-row justify-between mb-4">
			<div class="flex flex-col">
				<p>Order ID: {order.id}</p>
				<p>Created At: {new Date(order.createdAt).toLocaleDateString()}</p>
				<p>Updated At: {new Date(order.updatedAt).toLocaleDateString()}</p>
				<p>Status: {order.status}</p>
				{#if order.shippingId}
					<MiniShipping shippingMethodId={order.shippingId} />
				{/if}
			</div>
			<div class="flex flex-col items-end">
				{#if orderMode === 'sale'}
					<div>Buyer:</div>
					<MiniUser userId={order.buyerUserId} />
				{:else}
					<div>Seller:</div>
					<MiniUser userId={order.sellerUserId} />
				{/if}

				<StallName stallId={order.stallId} />
			</div>
		</div>
		<OrderActions
			{orderMode}
			orderStatus={order.status}
			orderId={order.id}
			on:confirmOrder={() => handleConfirmOrder(order)}
			on:markAsShipped={() => handleMarkAsShipped(order)}
			on:markAsReceived={() => handleMarkAsReceived(order)}
			on:cancelOrder={() => handleCancelOrder(order)}
		/>

		<Separator class={'my-4'} />
		<div>
			<p>Address: {order.address}</p>
			<p>Zip: {order.zip}</p>
			<p>City: {order.city}</p>
			<p>Country: {order.country}</p>
			<p>Region: {order.region}</p>
		</div>
		<Separator class={'my-4'} />
		<div>
			<p>Contact Name: {order.contactName}</p>
			<p>Contact Phone: {order.contactPhone}</p>
			<p>Contact Email: {order.contactEmail}</p>
			<p>Observations: {order.observations}</p>
		</div>
	</div>

	<Separator class={'my-4'} />

	<div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-8">
		{#each $productQueryResults as query}
			{#if query.isLoading}
				<p>Loading...</p>
			{:else if query.isError}
				<p>Error: {query.error.message}</p>
			{:else if query.isSuccess && query.data}
				<ProductItem product={query.data} qtyPurchased={order.orderItems.find((oi) => oi.productId === query.data?.id)?.qty} />
			{:else}
				<p>No data available</p>
			{/if}
		{/each}
	</div>

	{#if $invoices.data && $invoices.data.length > 0}
		<Separator class={'my-4'} />
		<h3 class="text-xl font-semibold mt-8 mb-4">Invoices</h3>
		<div class="space-y-4">
			<!-- TODO: We can create a common component for invoices with the markup, we are repeating this code in the checkout -->
			{#each $invoices.data as invoice (invoice.id)}
				<div class="flex flex-col p-4 bg-gray-50 rounded-lg shadow transition-all duration-200">
					<div class="flex justify-between items-start">
						<div class="flex flex-col">
							<span class="text-sm font-medium text-gray-500 uppercase">{invoice.type}</span>
							<span class="font-medium">Invoice ID: {invoice.id}</span>
							<span class="capitalize font-medium {getInvoiceStatusColor(invoice.invoiceStatus)}">
								{invoice.invoiceStatus}
							</span>
						</div>
						<div class="flex flex-col text-sm text-right">
							<span class="font-bold text-lg">{formatSats(parseInt(invoice.totalAmount))} sats</span>
							<span class="text-gray-600">{new Date(invoice.createdAt).toLocaleString()}</span>
						</div>
					</div>
					<!-- TODO: Maybe we can have this conditional in a variable a function `shouldRetry` -->
					{#if invoice.type === 'merchant' && orderMode === 'purchase' && invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="text-right"><Button class="w-32">Retry</Button></DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									{#each relevantPaymentDetails as paymentDetail}
										<DropdownMenu.Item on:click={() => (currentPaymentDetail = paymentDetail)}
											>`${paymentDetail.paymentMethod} - ${paymentDetail.paymentDetails}`</DropdownMenu.Item
										>
									{/each}
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						{#if merchantPaymentDetail?.paymentDetails}
							<PaymentProcessor
								paymentDetail={merchantPaymentDetail}
								amountSats={parseInt(invoice.totalAmount)}
								paymentType="v4v"
								on:paymentComplete={(e) => handlePaymentEvent(e, invoice.id)}
								on:paymentExpired={(e) => handlePaymentEvent(e, invoice.id)}
								on:paymentCanceled={(e) => handlePaymentEvent(e, invoice.id)}
							/>
						{/if}
					{/if}

					{#if invoice.type === 'v4v'}
						{#if orderMode === 'purchase'}
							<!-- TODO: Invoice retry button needs to be more robust, take care of min and max sendable and valid payment details -->
							<div class="p-2 bg-white flex justify-between items-center gap-2">
								<div>{invoice.paymentDetails}</div>
								{#if invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'}
									<Button class="w-32" on:click={() => handleRetryPayment(invoice.paymentDetails)}>Retry</Button>
								{:else}
									<Button class="w-32" variant="secondary" disabled>Done</Button>
								{/if}
							</div>
							{#if currentPaymentDetail && currentPaymentDetail.paymentDetails === invoice.paymentDetails}
								<PaymentProcessor
									paymentDetail={currentPaymentDetail}
									amountSats={parseInt(invoice.totalAmount)}
									paymentType="v4v"
									on:paymentComplete={(e) => handlePaymentEvent(e, invoice.id)}
									on:paymentExpired={(e) => handlePaymentEvent(e, invoice.id)}
									on:paymentCanceled={(e) => handlePaymentEvent(e, invoice.id)}
								/>
							{/if}
						{:else if invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'}
							<div class="p-2 flex justify-between items-center gap-2">
								<CheckPaymentDetail paymentDetails={invoice.paymentDetails} />
							</div>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
