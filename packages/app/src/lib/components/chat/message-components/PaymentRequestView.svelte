<script lang="ts">
	import type { PaymentRequestMessage } from '@plebeian/database/constants'

	import MessageHeader from './MessageHeader.svelte'

	export let message: PaymentRequestMessage
</script>

<div class="bg-accent/80 rounded-md p-3">
	<MessageHeader title="Payment Request" status={undefined} icon="i-mdi-lightning-bolt" />

	<div class="space-y-2 text-sm">
		<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
			<span class="text-muted-foreground">Order ID</span>
			<span>{message.id}</span>
			<span class="text-muted-foreground">Payment ID</span>
			<span class=" truncate">{message.payment_id}</span>
			{#if message.payment_options?.length > 0}
				{#each message.payment_options as option}
					<span class="text-muted-foreground">Method</span>
					<span>{option.type}</span>
				{/each}
			{/if}
		</div>
	</div>
</div>
