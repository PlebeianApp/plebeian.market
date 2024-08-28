<script lang="ts">
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import ndkStore from '$lib/stores/ndk'

	let currentPage: number

	$: orderList = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'seller')

	function handlePageChange(page: number) {
		currentPage = page
	}
</script>

{#key $orderList.data}
	{#if $orderList.isLoading}
		<div>Loading...</div>
	{:else if $orderList.data && $orderList.data.orders.length > 0}
		<div>
			<h2>Your Sales</h2>
			<OrderTable
				orders={$orderList.data.orders}
				{currentPage}
				orderMode="sale"
				on:pageChange={(event) => handlePageChange(event.detail)}
			/>
		</div>
	{:else}
		<div>You have no orders yet.</div>
	{/if}
{/key}
