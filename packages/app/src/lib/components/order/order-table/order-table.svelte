<script lang="ts">
	import type { DisplayOrder } from '$lib/server/orders.service'
	import MiniUser from '$lib/components/cart/mini-user.svelte'
	import StallName from '$lib/components/stalls/stall-name.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Table from '$lib/components/ui/table'
	import { updateOrderStatusMutation } from '$lib/fetch/order.mutations'
	import { createEventDispatcher } from 'svelte'
	import { createTable, Render, Subscribe } from 'svelte-headless-table'
	import { addPagination, addSortBy } from 'svelte-headless-table/plugins'
	import { toast } from 'svelte-sonner'
	import { writable } from 'svelte/store'

	import type { OrderStatus } from '@plebeian/database'

	import StatusCell from './status-cell.svelte'

	export let orders: DisplayOrder[] = []
	export let orderMode: 'list' | 'sale' | 'purchase'
	export let currentPage: number = 0

	const dispatch = createEventDispatcher()

	const ordersStore = writable(orders)

	const table = createTable(ordersStore, {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination({ pageSize: 10, initialPageIndex: currentPage }),
	})

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
			header: 'Order ID',
		}),
		orderMode === 'purchase'
			? table.column({
					accessor: 'sellerUserId',
					header: 'Seller',
				})
			: table.column({
					accessor: 'buyerUserId',
					header: 'Buyer',
				}),
		table.column({
			accessor: 'status',
			header: 'Status',
		}),
		table.column({
			accessor: 'region',
			header: 'Region',
		}),
		table.column({
			accessor: 'stallId',
			header: 'Stall',
		}),
		table.column({
			accessor: 'createdAt',
			header: orderMode === 'purchase' ? 'Purchased At' : 'Sold At',
			cell: ({ value }) => new Date(value).toLocaleDateString(),
		}),
	])

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns)
	const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page

	$: dispatch('pageChange', $pageIndex)

	function getCellWidth(columnId: string): string {
		const widths: Record<string, string> = {
			id: 'w-32',
			sellerUserId: 'w-48',
			buyerUserId: 'w-48',
			status: 'w-24',
			region: 'w-32',
			stallId: 'w-40',
			createdAt: 'w-auto',
		}
		return widths[columnId] || 'w-auto'
	}

	async function updateOrderStatus(order: DisplayOrder, newStatus: OrderStatus): Promise<void> {
		try {
			const updateOrder = await $updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: newStatus })
			if (updateOrder) {
				ordersStore.update((orders) => orders.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)))
				toast.success(`Order ${newStatus}`)
			}
		} catch (error) {
			console.error('Failed to update order status:', error)
			toast.error('Failed to update order status')
		}
	}

	const handleConfirmOrder = (order: DisplayOrder) => updateOrderStatus(order, 'confirmed')
	const handleMarkAsShipped = (order: DisplayOrder) => updateOrderStatus(order, 'shipped')
	const handleMarkAsReceived = (order: DisplayOrder) => updateOrderStatus(order, 'completed')
	const handleCancelOrder = (order: DisplayOrder) => updateOrderStatus(order, 'cancelled')
</script>

<Table.Root {...$tableAttrs}>
	<Table.Header>
		{#each $headerRows as headerRow}
			<Subscribe rowAttrs={headerRow.attrs()}>
				<Table.Row>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
							<Table.Head {...attrs}>
								{#if cell.id === 'sellerUserId' || cell.id === 'buyerUserId' || cell.id === 'status' || cell.id === 'region' || cell.id === 'createdAt'}
									<Button variant="ghost" class="border-none cursor-pointer" on:click={props.sort.toggle}>
										<Render of={cell.render()} />
									</Button>
								{:else}
									<Render of={cell.render()} />
								{/if}
							</Table.Head>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Header>
	<Table.Body {...$tableBodyAttrs} class="[&_tr:last-child]:border-2">
		{#each $pageRows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<Table.Row {...rowAttrs} class="border-2 border-black">
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<Table.Cell {...attrs} class="text-xs truncate {getCellWidth(cell.column.id)}">
								{#if cell.column.id === 'id'}
									<a href={`/dash/order/${orderMode}s/${cell.render()}`} class="underline">
										<Render of={cell.render()} />
									</a>
								{:else if cell.column.id === 'sellerUserId' || cell.column.id === 'buyerUserId'}
									<MiniUser userId={cell.render().toString()} />
								{:else if cell.column.id === 'status'}
									<StatusCell
										order={cell.row.original}
										{orderMode}
										{handleConfirmOrder}
										{handleMarkAsShipped}
										{handleMarkAsReceived}
										{handleCancelOrder}
									/>
								{:else if cell.column.id === 'stallId'}
									<StallName stallId={cell.render().toString()} />
								{:else}
									<Render of={cell.render()} />
								{/if}
							</Table.Cell>
						</Subscribe>
					{/each}
				</Table.Row>
			</Subscribe>
		{/each}
	</Table.Body>
</Table.Root>
<div class="flex items-center justify-end space-x-2 py-4">
	<Button variant="outline" size="sm" on:click={() => ($pageIndex = $pageIndex - 1)} disabled={!$hasPreviousPage}>Previous</Button>
	<b>{$pageIndex + 1}</b>
	<Button variant="outline" size="sm" disabled={!$hasNextPage} on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button>
</div>
