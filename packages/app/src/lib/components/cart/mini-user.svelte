<script lang="ts">
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import { Skeleton } from '../ui/skeleton'

	export let userId: string

	$: userProfileQuery = createUserByIdQuery(userId)
</script>

<div>
	{#if $userProfileQuery.isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{:else if $userProfileQuery.data?.id}
		<a href={`/p/${$userProfileQuery.data.id}`}>
			<div class="py-1 flex flex-row items-center gap-2">
				{#if $userProfileQuery.data.image}
					<CAvatar pubkey={userId} profile={$userProfileQuery.data} />
				{:else}
					<span class=" i-tdesign-user w-6 h-6" />
				{/if}
				{#if $userProfileQuery.data.name || $userProfileQuery.data.displayName || userId}
					<span class="text-sm font-bold"
						>{truncateString($userProfileQuery.data.name || $userProfileQuery.data.displayName || npubEncode(userId))}</span
					>
				{/if}
			</div>
		</a>
	{/if}
</div>
