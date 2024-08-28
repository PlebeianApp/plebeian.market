<script lang="ts">
	import type { DisplayOrder } from '$lib/server/orders.service'
	import MiniUser from '$lib/components/cart/mini-user.svelte'
	import StallName from '$lib/components/stalls/stall-name.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as Table from '$lib/components/ui/table'
	import { updateOrderStatusMutation } from '$lib/fetch/order.mutations'
	import { createEventDispatcher } from 'svelte'
	import { createTable, Render, Subscribe } from 'svelte-headless-table'
	import { addPagination, addSortBy } from 'svelte-headless-table/plugins'
	import { toast } from 'svelte-sonner'
	import { readable } from 'svelte/store'

	export let orders: DisplayOrder[] = []
	export let orderMode: 'list' | 'sale' | 'purchase'
	export let currentPage: number = 0

	const dispatch = createEventDispatcher()

	const table = createTable(readable(orders), {
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

	function getCellWidth(columnId: string) {
		switch (columnId) {
			case 'id':
				return 'w-32'
			case 'sellerUserId':
			case 'buyerUserId':
				return 'w-48'
			case 'status':
				return 'w-24'
			case 'region':
				return 'w-32'
			case 'stallId':
				return 'w-40'
			case 'createdAt':
				return 'w-auto'
			default:
				return 'w-auto'
		}
	}

	const handleConfirmOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'confirmed' })
		toast.success('Order confirmed')
	}

	const handleMarkAsShipped = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'shipped' })
		toast.success('Order marked as shipped')
	}

	const handleMarkAsReceived = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'completed' })
		toast.success('Order marked as received')
	}

	const handleCancelOrder = async (order: DisplayOrder): Promise<void> => {
		await $updateOrderStatusMutation.mutate({ orderId: order.id, status: 'cancelled' })
		toast.success('Order cancelled')
	}
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
									{#if orderMode === 'sale' && (cell.render() === 'pending' || cell.render() === 'confirmed')}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild let:builder>
												<Button size="sm" variant="secondary" builders={[builder]}>
													<Render of={cell.render()} />
												</Button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content>
												{#if cell.render() === 'pending'}
													<DropdownMenu.Item on:click={() => handleConfirmOrder(cell.row.original)}>Confirm Order</DropdownMenu.Item>
													<DropdownMenu.Item on:click={() => handleCancelOrder(cell.row.original)}>Cancel Order</DropdownMenu.Item>
												{:else if cell.render() === 'confirmed'}
													<DropdownMenu.Item on:click={() => handleMarkAsShipped(cell.row.original)}>Mark as Shipped</DropdownMenu.Item>
													<DropdownMenu.Item on:click={() => handleCancelOrder(cell.row.original)}>Cancel Order</DropdownMenu.Item>
												{/if}
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									{:else if orderMode !== 'sale' && (cell.render() === 'pending' || cell.render() === 'paid' || cell.render() === 'confirmed' || cell.render() === 'shipped')}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild let:builder>
												<Button size="sm" variant="secondary" builders={[builder]}>
													<Render of={cell.render()} />
												</Button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content>
												{#if cell.render() === 'pending' || cell.render() === 'paid' || cell.render() === 'confirmed'}
													<DropdownMenu.Item on:click={() => handleCancelOrder(cell.row.original)}>Cancel Order</DropdownMenu.Item>
												{:else if cell.render() === 'shipped'}
													<DropdownMenu.Item on:click={() => handleMarkAsReceived(cell.row.original)}>Mark as Received</DropdownMenu.Item>
												{/if}
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									{:else}
										<Render of={cell.render()} />
									{/if}
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
