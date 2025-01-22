<script lang="ts">
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible'
	import ndkStore from '$lib/stores/ndk'
	import { ordersStore } from '$lib/stores/orders'

	import type { OrderMessage } from '@plebeian/database/constants'

	import MessageHeader from './MessageHeader.svelte'

	export let message: OrderMessage
	let isOpen = false

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

	$: orderUrl = `/dash/order/${$ndkStore.activeUser?.pubkey == message.buyerUserId ? 'purchases' : 'sales'}/${message.id}`

	$: {
		ordersStore.addOrder(message)
	}
</script>

<div class="bg-accent/80 rounded-md p-3">
	<MessageHeader title={`Order #${message.id}`} status={message.status} icon={getStatusIcon(message.status)} />

	<Collapsible bind:open={isOpen}>
		<div class="space-y-2 text-sm">
			<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
				<span class="text-muted-foreground">Status</span>
				<span>{message.status}</span>
				{#if message.additionalInfo}
					<span class="text-muted-foreground">Notes</span>
					<span>{message.additionalInfo}</span>
				{/if}
			</div>

			<CollapsibleTrigger>
				<Button variant="ghost" size="sm" class="w-full flex items-center justify-between gap-2">
					<span>{isOpen ? 'Hide details' : 'Show details'}</span>
					<span class={isOpen ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'} />
				</Button>
			</CollapsibleTrigger>

			<CollapsibleContent>
				<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pt-2 border-t">
					<span class="text-muted-foreground">Contact</span>
					<span>{message.contactName}</span>

					{#if message.contactEmail}
						<span class="text-muted-foreground">Email</span>
						<span>{message.contactEmail}</span>
					{/if}

					{#if message.contactPhone}
						<span class="text-muted-foreground">Phone</span>
						<span>{message.contactPhone}</span>
					{/if}

					<span class="text-muted-foreground">Shipping Address</span>
					<div class="space-y-1">
						<p>{message.address}</p>
						<p>
							{message.city}{#if message.region}, {message.region}{/if}
						</p>
						<p>{message.zip}, {message.country}</p>
					</div>
				</div>
			</CollapsibleContent>
		</div>
	</Collapsible>

	<Button variant="primary" class="mt-3 w-full" on:click={() => goto(orderUrl)}>Go to order dashboard</Button>
</div>
