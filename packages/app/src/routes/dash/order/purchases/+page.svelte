<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import OrderTable from '$lib/components/order/order-table/order-table.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
	import ndkStore from '$lib/stores/ndk'

	import type { LayoutData } from '../../$types'

	export let data: LayoutData
	$: orderQuery = createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer', {
		orderBy: 'createdAt',
		order: 'desc',
	})
	const linkDetails = data.menuItems.find((item) => item.value === 'orders')?.links.find((item) => item.href === $page.url.pathname)
</script>

{#if $orderQuery.isLoading}
	<div>Loading...</div>
{:else if $orderQuery.data?.orders?.length}
	<div>
		<div class="flex items-center gap-1">
			<Button size="icon" variant="ghost" class="border-0" on:click={() => goto('/dash')}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-sm text-muted-foreground">{linkDetails?.description}</p>
			</section>
		</div>
		<OrderTable orders={$orderQuery.data.orders} orderMode="purchase" />
	</div>
{:else}
	<div class="flex items-center gap-1">
		<Button size="icon" variant="ghost" class="border-0" on:click={() => goto('/dash')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-sm text-muted-foreground">{linkDetails?.description}</p>
		</section>
	</div>
	<div>You have no orders yet.</div>
{/if}
