<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { createDecryptedMessage } from '$lib/utils/utils.dm'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let message: NDKEvent
	export let selectedPubkey: string
	export let isCurrentUser: boolean
	let userProfileQuery = createUserByIdQuery(message.pubkey)
	let decryptedContent = createDecryptedMessage(message, selectedPubkey)

	function formatMessage(content: string) {
		const urlRegex = /(https?:\/\/[^\s]+)/g
		return content.replace(urlRegex, (url) => `<span class="break-all">${url}</span>`)
	}
</script>

<div class="flex {isCurrentUser ? 'justify-end' : 'justify-start'}">
	<div class="flex {isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[75%] gap-2">
		{#if $userProfileQuery.data}
			<CAvatar pubkey={message.pubkey} profile={$userProfileQuery.data} />
		{/if}
		{#if $decryptedContent.data}
			<div
				class="bg-accent p-3 rounded-lg break-words overflow-hidden {isCurrentUser
					? 'rounded-br-none'
					: 'rounded-bl-none'} max-w-[calc(100%-3rem)]"
			>
				<p class="text-sm whitespace-pre-wrap">
					{@html formatMessage($decryptedContent.data)}
				</p>
				{#if message.created_at}
					<p class="text-xs text-muted-foreground mt-1">
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
