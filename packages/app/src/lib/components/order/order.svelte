<script lang="ts">
	import type { QueryObserverResult } from '@tanstack/svelte-query'
	import type { DisplayOrder } from '$lib/server/orders.service'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { updateOrderStatusMutation } from '$lib/fetch/order.mutations'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { toast } from 'svelte-sonner'
	import { derived } from 'svelte/store'

	import MiniUser from '../cart/mini-user.svelte'
	import ProductItem from '../product/product-item.svelte'
	import StallName from '../stalls/stall-name.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniShipping from './mini-shipping.svelte'
	import OrderActions from './order-actions.svelte'

	export let order: DisplayOrder
	export let orderMode: 'sale' | 'purchase'
	type ProductQueryResult = QueryObserverResult<DisplayProduct, Error>

	const handleConfirmOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'confirmed' })
		toast.success('Order confirmed')
	}

	const handleMarkAsShipped = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'shipped' })
		toast.success('Order marked as shipped')
	}

	const handleMarkAsReceived = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'completed' })
		toast.success('Order marked as received')
	}

	const handleCancelOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'cancelled' })
		toast.success('Order cancelled')
	}

	$: productQueries = order?.orderItems ? order.orderItems.map((item) => createProductQuery(item.productId)) : []

	$: productQueryResults = derived(productQueries, ($queries) => $queries.map(($q) => $q))
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

	{#each $productQueryResults as query}
		{#if query.isLoading}
			<p>Loading...</p>
		{:else if query.isError}
			<p>Error: {query.error.message}</p>
		{:else if query.isSuccess && query.data}
			<ProductItem product={query.data} />
			<!-- Display other product details -->
		{:else}
			<p>No data available</p>
		{/if}
	{/each}
</div>
