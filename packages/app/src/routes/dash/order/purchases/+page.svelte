<script lang="ts">
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import ndkStore from '$lib/stores/ndk'

	$: orderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer', {
		orderBy: 'createdAt',
		order: 'desc',
	})
</script>

{#if $orderQuery.isLoading}
	<div>Loading...</div>
{:else if $orderQuery.data?.orders?.length}
	<div>
		<OrderTable orders={$orderQuery.data.orders} orderMode="purchase" />
	</div>
{:else}
	<div class="p-6">You have no orders yet.</div>
{/if}
