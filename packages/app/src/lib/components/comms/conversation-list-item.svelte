<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { Button } from '$lib/components/ui/button'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let pubkey: string
	export let messages: NDKEvent[]
	export let onSelect: (pubkey: string) => void

	$: userProfileQuery = createUserByIdQuery(pubkey)

	function getLastMessage(messages: NDKEvent[]) {
		const lastMessage = messages[messages.length - 1]
		return lastMessage ? lastMessage.content.slice(0, 30) + '...' : 'No messages'
	}

	$: lastMessage = getLastMessage(messages)
</script>

<Button variant="ghost" class="w-full justify-start p-4 hover:bg-accent" on:click={() => onSelect(pubkey)}>
	<CAvatar {pubkey} profile={$userProfileQuery.data} />
	<div class="flex flex-col items-start">
		<span class="font-semibold">{$userProfileQuery?.data?.displayName || $userProfileQuery?.data?.name || truncateString(pubkey)}</span>
		<span class="text-sm text-muted-foreground truncate">{lastMessage}</span>
	</div>
</Button>
