<script lang="ts">
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import ndkStore from '$lib/stores/ndk'

	$: orderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer')
</script>

{#if $orderQuery.isLoading}
	<div>Loading...</div>
{:else if $orderQuery.data?.orders?.length}
	<div>
		<h2>Your Orders</h2>
		<OrderTable orders={$orderQuery.data.orders} orderMode="purchase" />
	</div>
{:else}
	<div>You have no orders yet.</div>
{/if}
