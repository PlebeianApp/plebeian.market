<script lang="ts">
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { createOrdersQuery } from '$lib/fetch/order.queries'
	import ndkStore from '$lib/stores/ndk'

	$: orderList = createOrdersQuery({ userId: $ndkStore.activeUser?.pubkey, role: 'buyer' })
</script>

{#if $orderList.isLoading}
	<div>Loading...</div>
{:else if $orderList.data && $orderList.data.orders.length > 0}
	<div>
		<h2>Your Orders</h2>
		<OrderTable orders={$orderList.data.orders} orderMode="purchase" />
	</div>
{:else}
	<div>You have no orders yet.</div>
{/if}
