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

<Button variant="ghost" class="w-full h-full justify-start p-4 py-8 sm:py-4 gap-2 hover:bg-accent" on:click={() => onSelect(pubkey)}>
	<CAvatar linked {pubkey} profile={$userProfileQuery.data} />
	<div class="flex flex-col items-start overflow-hidden flex-1">
		<div class="flex items-center w-full">
			<span class="font-semibold truncate">
				{$userProfileQuery?.data?.displayName || $userProfileQuery?.data?.name || truncateString(pubkey)}
			</span>
			{#if unreadCount > 0}
				<Badge variant="destructive" class="ml-2 px-1 py-0" size="sm">
					{unreadCount}
				</Badge>
			{/if}
		</div>
		<div class="h-full overflow-y-auto flex flex-col">
			<div class="text-sm text-muted-foreground truncate ml-2">
				Last: {new Date(lastMessagets * 1000).toLocaleString()}
			</div>
		</div>
	</div>
</Button>
