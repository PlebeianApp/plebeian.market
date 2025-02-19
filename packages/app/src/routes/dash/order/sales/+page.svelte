<script lang="ts">
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import * as Select from '$lib/components/ui/select'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'
	import { Package } from 'lucide-svelte'
	import { writable } from 'svelte/store'

	import { ORDER_STATUS } from '@plebeian/database/constants'

	const selectedShopId = writable<string | null>(null)
	const selectedShopName = writable<string>('All Sales')
	const selectedStatus = writable<string | null>(null)
	const selectedStatusName = writable<string>('Any Status')

	const statusOptions = [
		{ id: ORDER_STATUS.PENDING, name: 'Pending' },
		{ id: ORDER_STATUS.CONFIRMED, name: 'Confirmed' },
		{ id: ORDER_STATUS.SHIPPED, name: 'Shipped' },
		{ id: ORDER_STATUS.COMPLETED, name: 'Completed' },
		{ id: ORDER_STATUS.CANCELED, name: 'Cancelled' },
	]

	$: orderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'seller', {
		orderBy: 'createdAt',
		order: 'desc',
	})

	// Filter orders based on selected stall and status
	$: filteredOrders =
		$orderQuery.data?.orders?.filter(
			(order) => (!$selectedShopId || order.stallId === $selectedShopId) && (!$selectedStatus || order.status === $selectedStatus),
		) ?? []

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
		pageSize: 999,
	})
</script>

{#if $orderQuery.isLoading}
	<div>Loading...</div>
{:else}
	<div class="flex flex-col sm:flex-row gap-2">
		{#if ($stallsQuery.data?.stalls?.length ?? 0) > 1}
			<!-- Shop Filter -->
			<div class="w-full sm:flex-1">
				<Select.Root
					selected={{
						value: $selectedShopId,
						label: $selectedShopName,
					}}
					onSelectedChange={(sEvent) => {
						if (sEvent) {
							$selectedShopId = sEvent.value
							$selectedShopName = sEvent.label ?? 'All Sales'
						}
					}}
				>
					<Select.Trigger>
						{#if $selectedShopId}
							<div class="flex items-center gap-2">
								<span class="i-tdesign-store w-6 h-6" />
								{$selectedShopName}
							</div>
						{:else}
							<div class="flex items-center gap-2">
								<span class="i-mingcute-earth-2-line w-6 h-6" />
								All Shops
							</div>
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value={null}>
							<div class="flex items-center gap-2">
								<span class="i-mingcute-earth-2-line w-6 h-6" />
								All Shops
							</div>
						</Select.Item>
						{#each $stallsQuery.data?.stalls ?? [] as stall (stall.id)}
							<Select.Item value={stall.id}>
								<div class="flex items-center gap-2">
									<span class="i-tdesign-store w-6 h-6" />
									{stall.name}
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{/if}

		<!-- Status Filter -->
		<div class="w-full sm:flex-1">
			<Select.Root
				selected={{
					value: $selectedStatus,
					label: $selectedStatusName,
				}}
				onSelectedChange={(sEvent) => {
					if (sEvent) {
						$selectedStatus = sEvent.value
						$selectedStatusName = sEvent.label ?? 'All Status'
					}
				}}
			>
				<Select.Trigger>
					{#if $selectedStatus}
						<div class="flex items-center gap-2">
							<Package class="h-6 w-6" />
							{$selectedStatusName}
						</div>
					{:else}
						<div class="flex items-center gap-2">
							<Package class="h-6 w-6" />
							Any Status
						</div>
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value={null}>
						<div class="flex items-center gap-2">
							<Package class="h-6 w-6" />
							Any Status
						</div>
					</Select.Item>
					{#each statusOptions as status (status.id)}
						<Select.Item value={status.id}>
							<div class="flex items-center gap-2">
								<Package class="h-6 w-6" />
								{status.name}
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	{#if filteredOrders.length}
		<OrderTable orders={filteredOrders} orderMode="sale" />
	{:else}
		<div class="p-6">No orders found.</div>
	{/if}
{/if}
