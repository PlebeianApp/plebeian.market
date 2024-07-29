<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchUserData } from '$lib/nostrSubs/utils'
	import { checkIfUserExists } from '$lib/utils'
	import { onMount } from 'svelte'

	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '../ui/avatar/avatar-image.svelte'
	import Avatar from '../ui/avatar/avatar.svelte'
	import { Skeleton } from '../ui/skeleton'

	export let userId: string
	let userExist: boolean | undefined = undefined
	let userProfile: NDKUserProfile | null = null

	$: userProfileQuery = userExist !== undefined && userExist ? createUserByIdQuery(userId) : undefined
	$: isLoading = $userProfileQuery?.isLoading ?? false

	$: {
		if (userExist && $userProfileQuery?.data) userProfile = $userProfileQuery.data
	}

	onMount(async () => {
		userExist = await checkIfUserExists(userId)

		if (!userExist) {
			isLoading = true
			const { userProfile: userData } = await fetchUserData(userId, NDKSubscriptionCacheUsage.ONLY_CACHE)
			if (userData) (userProfile = userData) && (userProfile.id = userId)
			isLoading = false
		}
	})
</script>

<div>
	{#if isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{:else if userProfile?.id}
		<a href={`/p/${userProfile.id}`}>
			<div class="py-1 flex flex-row items-center gap-2">
				{#if userProfile.image}
					<Avatar class="w-6 h-6">
						<AvatarImage src={userProfile.image} alt="pfp" />
						<AvatarFallback style={`background-color: #${String(userProfile.id).substring(0, 6)}`}
							><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback
						>
					</Avatar>
				{:else}
					<span class=" i-tdesign-user w-6 h-6" />
				{/if}
				<span class=" font-bold">{userProfile.name}</span>
			</div>
		</a>
	{/if}
</div>
