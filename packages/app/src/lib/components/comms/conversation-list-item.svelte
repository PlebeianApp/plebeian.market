<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let pubkey: string
	export let lastMessagets: number
	export let onSelect: (pubkey: string) => void

	$: userProfileQuery = createUserByIdQuery(pubkey)
</script>

<Button variant="ghost" class="w-full justify-start py-6 px-6 border-0 gap-2 hover:bg-accent" on:click={() => onSelect(pubkey)}>
	<CAvatar {pubkey} profile={$userProfileQuery.data} />
	<div class="flex flex-col items-start overflow-hidden">
		<span class="font-semibold truncate"
			>{$userProfileQuery?.data?.displayName || $userProfileQuery?.data?.name || truncateString(pubkey)}</span
		>
		<span class="text-sm text-muted-foreground truncate w-full">Last message: {new Date(lastMessagets * 1000).toLocaleString()}</span>
	</div>
</Button>
