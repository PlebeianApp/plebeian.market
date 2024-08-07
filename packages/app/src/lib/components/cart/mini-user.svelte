<script lang="ts">
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'

	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '../ui/avatar/avatar-image.svelte'
	import Avatar from '../ui/avatar/avatar.svelte'
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
					<Avatar class="w-6 h-6">
						<AvatarImage src={$userProfileQuery.data.image} alt="pfp" />
						<AvatarFallback style={`background-color: #${String($userProfileQuery.data.id).substring(0, 6)}`}
							><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback
						>
					</Avatar>
				{:else}
					<span class=" i-tdesign-user w-6 h-6" />
				{/if}
				{#if $userProfileQuery.data.name || $userProfileQuery.data.displayName || $userProfileQuery.data.id}
					<span class=" font-bold"
						>{truncateString(
							$userProfileQuery.data.name || $userProfileQuery.data.displayName || npubEncode($userProfileQuery.data.id),
						)}</span
					>
				{/if}
			</div>
		</a>
	{/if}
</div>
