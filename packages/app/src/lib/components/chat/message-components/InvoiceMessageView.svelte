<script lang="ts">
	import type { InvoiceMessage } from '@plebeian/database/constants'

	import MessageHeader from './MessageHeader.svelte'

	export let message: InvoiceMessage

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'paid':
				return 'i-mdi-check-circle'
			case 'pending':
				return 'i-mdi-clock-outline'
			case 'expired':
				return 'i-mdi-alert-circle'
			default:
				return 'i-mdi-receipt'
		}
	}
</script>

<div class="bg-accent/80 rounded-md p-3">
	<MessageHeader
		title={`Invoice #${message.id}`}
		status={message.invoiceStatus ?? undefined}
		icon={getStatusIcon(message.invoiceStatus ?? '') ?? undefined}
	/>

	<div class="space-y-2 text-sm">
		<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
			<span class="text-muted-foreground">Type</span>
			<span>{message.type}</span>
			<span class="text-muted-foreground">Amount</span>
			<span>{message.totalAmount} sats</span>
			<span class="text-muted-foreground">Order ID</span>
			<span>{message.orderId}</span>
			<span class="text-muted-foreground">Status</span>
			<span>{message.invoiceStatus}</span>
		</div>
	</div>
</div>
