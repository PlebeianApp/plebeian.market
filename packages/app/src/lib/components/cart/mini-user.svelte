<script lang="ts">
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import { Skeleton } from '../ui/skeleton'

	export let userId: string
	export let mode: 'minimal' | 'compact' | 'full' = 'minimal'
	export let showNpub: boolean = true

	const userNpub = npubEncode(userId)
	$: userProfileQuery = createUserByIdQuery(userId, undefined, true)
</script>

<div>
	{#if $userProfileQuery.data}
		<a href={`/p/${$userProfileQuery.data.id || userId}`}>
			<div class="flex flex-row items-center justify-between">
				<div class="py-1 flex flex-row items-center gap-2">
					{#if $userProfileQuery.data.image}
						<CAvatar pubkey={userId} profile={$userProfileQuery.data} />
					{:else}
						<span class="i-tdesign-user w-6 h-6" />
					{/if}
					{#if $userProfileQuery.data.name || $userProfileQuery.data.displayName || userId}
						<div class=" flex flex-col">
							<span class="text-sm font-bold">
								{truncateString($userProfileQuery.data.name || $userProfileQuery.data.displayName || userNpub)}
							</span>
							{#if showNpub}
								<span class="text-xs text-muted-foreground">
									{truncateString(userNpub)}
								</span>
							{/if}
						</div>
					{/if}
				</div>

				{#if mode === 'compact'}
					<div class="ml-8 flex flex-row text-sm">
						{#if $userProfileQuery.data.nip05}
							<span class="text-muted-foreground">{$userProfileQuery.data.nip05}</span>
						{/if}
						{#if $userProfileQuery.data.bio}
							<span class="text-muted-foreground">{truncateString($userProfileQuery.data.bio, 50)}</span>
						{/if}
					</div>
				{/if}

				{#if mode === 'full'}
					<div class="ml-8 flex flex-col text-sm gap-1">
						{#if $userProfileQuery.data.nip05}
							<div class="flex gap-2">
								<span class="text-muted-foreground">NIP-05:</span>
								<span>{$userProfileQuery.data.nip05}</span>
							</div>
						{/if}
						{#if $userProfileQuery.data.pubkey}
							<div class="flex gap-2">
								<span class="text-muted-foreground">Pubkey:</span>
								<span>{truncateString(npubEncode(userId), 16)}</span>
							</div>
						{/if}
						{#if $userProfileQuery.data.bio}
							<div class="flex gap-2">
								<span class="text-muted-foreground">Bio:</span>
								<span>{$userProfileQuery.data.bio}</span>
							</div>
						{/if}
						{#if $userProfileQuery.data.website}
							<div class="flex gap-2">
								<span class="text-muted-foreground">Website:</span>
								<a href={$userProfileQuery.data.website} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
									{$userProfileQuery.data.website}
								</a>
							</div>
						{/if}
						{#if $userProfileQuery.data.lud16}
							<div class="flex gap-2">
								<span class="text-muted-foreground">Lightning:</span>
								<span>{$userProfileQuery.data.lud16}</span>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</a>
	{:else if $userProfileQuery.isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{/if}
</div>
