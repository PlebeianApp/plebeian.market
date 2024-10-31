<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from '$lib/components/ui/button/button.svelte'
	import ndkStore from '$lib/stores/ndk'

	import type { OrderMessage } from '@plebeian/database/constants'

	import MessageHeader from './MessageHeader.svelte'

	export let message: OrderMessage

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

	$: orderUrl = `order/${$ndkStore.activeUser?.pubkey == message.buyerUserId ? 'sales' : 'purchases'}/${message.id}`
</script>

<div class="bg-accent/80 rounded-md p-3">
	<MessageHeader title={`Order #${message.id}`} status={message.status} icon={getStatusIcon(message.status)} />
	<div class="space-y-2 text-sm">
		<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
			<span class="text-muted-foreground">Status</span>
			<span>{message.status}</span>
			{#if message.observations}
				<span class="text-muted-foreground">Notes</span>
				<span>{message.observations}</span>
			{/if}
		</div>
		<Button on:click={() => goto(orderUrl)}>Go to order dashboard</Button>
	</div>
</div>
