<script lang="ts">
	import { page } from '$app/stores'
	import Order from '$lib/components/order/order.svelte'
	import { createOrderQuery } from '$lib/fetch/order.queries'

	const orderId = $page.params.orderId
	$: orderIdQuery = createOrderQuery(orderId)
</script>

{#if $orderIdQuery.isLoading}
	<div>Loading...</div>
{:else if $orderIdQuery.data}
	<Order order={$orderIdQuery.data} orderMode={'sale'} />
{:else}
	<div>Order not found.</div>
{/if}
