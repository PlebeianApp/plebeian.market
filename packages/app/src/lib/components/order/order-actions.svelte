<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import type { OrderMode } from './types'
	import Button from '../ui/button/button.svelte'

	export let orderMode: OrderMode
	export let orderStatus: string
	export let orderId: string

	const dispatch = createEventDispatcher()

	const handleConfirmOrder = () => {
		dispatch('confirmOrder', orderId)
	}

	const handleMarkAsShipped = () => {
		dispatch('markAsShipped', orderId)
	}

	const handleMarkAsReceived = () => {
		dispatch('markAsReceived', orderId)
	}

	const handleCancelOrder = () => {
		dispatch('cancelOrder', orderId)
	}
</script>

<div class="flex justify-end gap-4">
	<!-- FIXME: we are having a sqlite foreign key constraint error -->
	{#if orderMode === 'sale'}
		{#if orderStatus === 'pending'}
			<Button variant="primary" on:click={handleConfirmOrder}>Confirm Order</Button>
			<Button variant="destructive" on:click={handleCancelOrder}>Cancel Order</Button>
		{:else if orderStatus === 'confirmed'}
			<Button variant="primary" on:click={handleMarkAsShipped}>Mark as Shipped</Button>
		{:else}
			No actions
		{/if}
	{:else if orderMode === 'purchase'}
		{#if orderStatus === 'pending'}
			<Button variant="destructive" on:click={handleCancelOrder}>Cancel Order</Button>
		{:else if orderStatus === 'shipped'}
			<Button variant="primary" on:click={handleMarkAsReceived}>Mark as Received</Button>
		{:else}
			No actions
		{/if}
	{/if}
</div>
