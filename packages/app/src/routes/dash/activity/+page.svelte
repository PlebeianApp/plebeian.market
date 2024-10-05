<script lang="ts">
	import { goto } from '$app/navigation'
	import ConversationListItem from '$lib/components/chat/conversation-list-item.svelte'
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import { unseenDMs } from '$lib/nostrSubs/subs'
	import { pendingPurchasedOrders, pendingSalesOrders } from '$lib/stores/activity'
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
