<script lang="ts">
	import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { ComponentType } from 'svelte'
	import { createDecryptedMessage } from '$lib/utils/dm.utils'

	import type { MessageObject } from './message-parser'
	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import InvoiceMessageView from './message-components/InvoiceMessageView.svelte'
	import OrderMessageView from './message-components/OrderMessageView.svelte'
	import PaymentRequestView from './message-components/PaymentRequestView.svelte'
	import StatusUpdateView from './message-components/StatusUpdateView.svelte'
	import { parseMessage } from './message-parser'

	export let message: NDKEvent
	export let selectedPubkey: string
	export let isCurrentUser: boolean
	export let userProfile: NDKUserProfile

	let decryptedContent = createDecryptedMessage(message, selectedPubkey)

	function formatTextMessage(content: string) {
		return content
			.replace(
				/(https?:\/\/[^\s]+)/g,
				(url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">${url}</a>`,
			)
			.split('\n')
			.map((line) => line.trim())
			.join('<br>')
	}

	function renderObjectMessage(obj: MessageObject): ComponentType | null {
		switch (obj.type) {
			case 0:
				return OrderMessageView
			case 1:
				return PaymentRequestView
			case 2:
				return StatusUpdateView
			default: {
				if ('invoiceStatus' in obj) return InvoiceMessageView
				return null
			}
		}
	}
</script>

<div class="flex {isCurrentUser ? 'justify-end' : 'justify-start'}">
	<div class="flex {isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[95%] gap-2">
		<CAvatar pubkey={message.pubkey} profile={userProfile} />

		{#if $decryptedContent.data}
			{@const parsed = parseMessage($decryptedContent.data)}
			<div class=" overflow-hidden {isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'}">
				{#if parsed.type === 'object'}
					{@const Component = renderObjectMessage(parsed.data)}
					{#if Component}
						<svelte:component this={Component} message={parsed.data} />
					{:else}
						<div class="bg-accent p-3">
							<p class="text-sm font-mono overflow-x-auto">
								{JSON.stringify(parsed.data, null, 2)}
							</p>
						</div>
					{/if}
				{:else}
					<div class="bg-accent p-3">
						<p class="text-sm whitespace-pre-wrap">
							{@html formatTextMessage(parsed.data)}
						</p>
					</div>
				{/if}

				{#if message.created_at}
					<p class="text-xs text-muted-foreground mt-1 px-3 pb-2">
						{new Date(Number(message.created_at) * 1000).toLocaleString()}
					</p>
				{/if}
			</div>
		{:else if $decryptedContent.isLoading}
			<div class="bg-accent p-3 rounded-lg">
				<p class="text-sm">Decrypting...</p>
			</div>
		{:else if $decryptedContent.error}
			<div class="bg-accent p-3 rounded-lg">
				<p class="text-sm text-destructive">Failed to decrypt message</p>
			</div>
		{/if}
	</div>
</div>
