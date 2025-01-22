<script lang="ts">
	import { ordersStore } from '$lib/stores/orders'

	import type { OrderStatus, OrderStatusUpdateMessage } from '@plebeian/database/constants'

	import MessageHeader from './MessageHeader.svelte'

	export let message: OrderStatusUpdateMessage

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'paid':
				return 'i-mdi-check-circle'
			case 'shipped':
				return 'i-mdi-truck-delivery'
			case 'cancelled':
				return 'i-mdi-cancel'
			default:
				return 'i-mdi-shopping'
		}
	}

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case 'shipped':
				return 'text-info'
			case 'cancelled':
				return 'text-destructive'
			case 'confirmed':
				return 'text-primary'
			default:
				return 'text-muted-foreground'
		}
	}

	$: {
		ordersStore.updateStatusByMsg(message)
	}
</script>

<div class="bg-accent/80 rounded-md p-3">
	<MessageHeader title="Order Status Update" status={undefined} icon={getStatusIcon(message.status)} />

	<div class="space-y-2 text-sm">
		<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
			<span class="text-muted-foreground">Order ID</span>
			<span>{message.id}</span>
			<span class="text-muted-foreground">Status</span>
			<span class={getStatusColor(message.status)}>{message.status}</span>
			{#if message.message}
				<span class="text-muted-foreground">Message</span>

				<span class="text-sm">{message.message}</span>
			{/if}
		</div>
	</div>
</div>
