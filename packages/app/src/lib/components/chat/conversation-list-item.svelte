<script lang="ts">
	import { Badge } from '$lib/components/ui/badge'
	import { Button } from '$lib/components/ui/button'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { unreadCounts } from '$lib/stores/chat-notifications'
	import { truncateString } from '$lib/utils'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let pubkey: string
	export let lastMessagets: number
	export let onSelect: (pubkey: string) => void

	$: userProfileQuery = createUserByIdQuery(pubkey, true, true)
	$: unreadCount = $unreadCounts[pubkey] || 0
</script>

<Button variant="ghost" class="w-full justify-start py-6 px-6 border-0 gap-2 hover:bg-accent relative" on:click={() => onSelect(pubkey)}>
	<CAvatar {pubkey} profile={$userProfileQuery.data} />
	<div class="flex flex-col items-start overflow-hidden flex-1">
		<div class="flex justify-between items-center w-full">
			<span class="font-semibold truncate">
				{$userProfileQuery?.data?.displayName || $userProfileQuery?.data?.name || truncateString(pubkey)}
			</span>
			{#if unreadCount > 0}
				<Badge variant="destructive" class="ml-2">
					{unreadCount}
				</Badge>
			{/if}
		</div>
		<span class="text-sm text-muted-foreground truncate w-full">
			Last message: {new Date(lastMessagets * 1000).toLocaleString()}
		</span>
	</div>
</Button>
