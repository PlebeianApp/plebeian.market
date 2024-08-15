<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import { useDecryptedMessage } from './useDecryptMessage'

	export let message: NDKEvent
	export let selectedPubkey: string
	export let isCurrentUser: boolean
	let userProfileQuery = createUserByIdQuery(message.pubkey)
	let decryptedContent = useDecryptedMessage(message, selectedPubkey)
</script>

<div class="flex {isCurrentUser ? 'justify-end' : 'justify-start'}">
	<div class="flex {isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[75%] gap-2">
		{#if $userProfileQuery.data}
			<CAvatar pubkey={message.pubkey} profile={$userProfileQuery.data} />
		{/if}
		{#if $decryptedContent.data}
			<div class="bg-accent p-3 rounded-lg break-words {isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'}">
				<p class="text-sm">{$decryptedContent.data}</p>
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
