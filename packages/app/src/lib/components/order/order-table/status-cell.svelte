<script lang="ts">
	import type { DisplayOrder } from '$lib/server/orders.service'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'

	export let order: DisplayOrder
	export let orderMode: 'list' | 'sale' | 'purchase'
	export let handleConfirmOrder: (order: DisplayOrder) => Promise<void>
	export let handleMarkAsShipped: (order: DisplayOrder) => Promise<void>
	export let handleMarkAsReceived: (order: DisplayOrder) => Promise<void>
	export let handleCancelOrder: (order: DisplayOrder) => Promise<void>

	$: isDropdownVisible =
		(orderMode === 'sale' && ['pending', 'confirmed'].includes(order.status)) ||
		(orderMode !== 'sale' && ['pending', 'paid', 'confirmed', 'shipped'].includes(order.status))

	$: dropdownItems =
		orderMode === 'sale'
			? order.status === 'pending'
				? [
						{ label: 'Confirm Order', action: handleConfirmOrder },
						{ label: 'Cancel Order', action: handleCancelOrder },
					]
				: [
						{ label: 'Mark as Shipped', action: handleMarkAsShipped },
						{ label: 'Cancel Order', action: handleCancelOrder },
					]
			: order.status === 'shipped'
				? [{ label: 'Mark as Received', action: handleMarkAsReceived }]
				: [{ label: 'Cancel Order', action: handleCancelOrder }]
</script>

{#if isDropdownVisible}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button size="sm" variant="secondary" builders={[builder]}>
				{order.status}
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each dropdownItems as item}
				<DropdownMenu.Item on:click={() => item.action(order)}>{item.label}</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	{order.status}
{/if}
