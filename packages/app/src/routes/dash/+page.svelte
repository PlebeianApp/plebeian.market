<script lang="ts">
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import { unreadCounts } from '$lib/stores/chat-notifications'
	import ndkStore from '$lib/stores/ndk'

	$: sellerQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'seller', {
		orderBy: 'createdAt',
		order: 'desc',
	})

	$: buyerQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer', {
		orderBy: 'createdAt',
		order: 'desc',
	})

	$: activeSellerOrders = $sellerQuery.data?.orders.filter((order) => order.status === 'pending') ?? []

	$: activeBuyerOrders = $buyerQuery.data?.orders.filter((order) => order.status === 'pending') ?? []

	$: totalUnreadMessages = Object.values($unreadCounts).reduce((sum, count) => sum + count, 0)
	$: activeConversations = Object.values($unreadCounts).filter((count) => count > 0).length
</script>

<div class="w-full lg:max-w-4xl lg:mx-auto">
	<div class="flex flex-col gap-4">
		{#if totalUnreadMessages > 0}
			<div class="w-full">
				<h2 class="text-xl font-semibold mb-3">Messages</h2>
				<div>
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div class="space-y-1">
							<div class="font-medium break-words">
								<span class="font-bold">{totalUnreadMessages}</span> unread
								{totalUnreadMessages === 1 ? 'message' : 'messages'} from
								<span class="font-bold">{activeConversations}</span>
								{activeConversations === 1 ? 'contact' : 'contacts'}
							</div>
						</div>
						<Button variant="secondary" size="sm" class="w-full sm:w-auto" on:click={() => goto('/dash/messages')}>View Messages</Button>
					</div>
				</div>
			</div>
			<Separator />
		{/if}

		{#if activeSellerOrders.length > 0 || activeBuyerOrders.length > 0}
			<div class="w-full">
				<h2 class="text-xl font-semibold mb-3">Pending Orders</h2>
				<div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
					{#if activeSellerOrders.length > 0}
						<div class=" flex flex-col gap-2">
							<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div>
									<div class="text-lg font-medium">Sales</div>
									<div class="text-sm">
										<span class="font-bold">{activeSellerOrders.length}</span> pending
										{activeSellerOrders.length === 1 ? 'order' : 'orders'}
									</div>
								</div>
								<Button variant="secondary" size="sm" class="w-full sm:w-auto" on:click={() => goto('/dash/order/sales')}>
									View Sales
								</Button>
							</div>
							<Separator />
						</div>
					{/if}
					{#if activeBuyerOrders.length > 0}
						<div class=" flex flex-col gap-2">
							<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div>
									<div class="text-lg font-medium">Purchases</div>
									<div class="text-sm">
										<span class="font-bold">{activeBuyerOrders.length}</span> pending
										{activeBuyerOrders.length === 1 ? 'order' : 'orders'}
									</div>
								</div>
								<Button variant="secondary" size="sm" class="w-full sm:w-auto" on:click={() => goto('/dash/order/purchases')}>
									View Purchases
								</Button>
							</div>
							<Separator />
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
