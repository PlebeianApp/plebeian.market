<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/button'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'

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
	<Avatar class="h-12 w-12 mr-4">
		<AvatarImage src={$userProfileQuery?.data?.image || `https://robohash.org/${pubkey}`} />
		<AvatarFallback>{$userProfileQuery?.data?.displayName}</AvatarFallback>
	</Avatar>
	<div class="flex flex-col items-start">
		<span class="font-semibold">{$userProfileQuery?.data?.displayName || $userProfileQuery?.data?.name || truncateString(pubkey)}</span>
		<span class="text-sm text-muted-foreground truncate">{lastMessage}</span>
	</div>
</Button>
