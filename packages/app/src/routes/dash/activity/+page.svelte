<script lang="ts">
	import { redirect } from '@sveltejs/kit'
	import { goto } from '$app/navigation'
	import ConversationListItem from '$lib/components/chat/conversation-list-item.svelte'
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import { groupedDMs, unseenDMs } from '$lib/nostrSubs/subs'
	import { pendingPurchasedOrders, pendingSalesOrders } from '$lib/stores/activity'
	import ndkStore from '$lib/stores/ndk'

	import { ORDER_STATUS } from '@plebeian/database/constants'

	// $: purchasedOrderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer')
	// $: pendingPurchasedOrders = $purchasedOrderQuery.data?.orders.filter((order) => order.status === ORDER_STATUS.PENDING)

	// $: salesOrderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'seller')
	// $: pendingSalesOrders = $salesOrderQuery.data?.orders.filter((order) => order.status === ORDER_STATUS.PENDING)
</script>

<div class="pb-4 space-y-2">
	{#if Object.keys($unseenDMs).length}
		<div>
			<h2>Unseen Messages</h2>
			<div class="max-h-64 overflow-y-auto">
				{#each Object.entries($unseenDMs) as [pubkey, messages]}
					<ConversationListItem
						{pubkey}
						lastMessages={Number(messages[0].created_at)}
						onSelect={() => {
							goto(`/dash/messages/${pubkey}`)
						}}
					/>
				{/each}
			</div>
		</div>
	{/if}
	{#if $pendingPurchasedOrders?.length}
		<div>
			<h2>Pending Purchased Orders</h2>
			<OrderTable orders={$pendingPurchasedOrders} orderMode="purchase" />
		</div>
	{/if}
	{#if $pendingSalesOrders?.length}
		<div>
			<h2>Pending Sales</h2>
			<OrderTable orders={$pendingSalesOrders} orderMode="purchase" />
		</div>
	{/if}
</div>
