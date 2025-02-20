<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte'
	import Avatar from '$lib/components/ui/avatar/avatar.svelte'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { isUserVerified } from '$lib/nostrSubs/utils'
	import { getHexColorFingerprintFromHexPubkey, resolveQuery } from '$lib/utils'
	import { getProfileName } from '$lib/utils/userProfile.utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	export let pubkey: string
	export let profile: NDKUserProfile | null
	export let linked = false
	export let containerClass = ''
	export let avatarClass = ''
	export let imageClass = ''
	export let fallbackClass = ''
	$: hexColorFromPubkey = getHexColorFingerprintFromHexPubkey(pubkey)
	$: displayName = getProfileName(profile, pubkey)
	let userVerified: boolean | null

	const validateNip05 = async () => {
		userVerified = await isUserVerified(pubkey)
	}

	onMount(async () => {
		if (!profile) profile = await resolveQuery(() => createUserByIdQuery(pubkey))
		validateNip05()
	})
</script>

{#if linked}
	<a href={`/p/${userVerified ? (profile?.nip05 ?? npubEncode(pubkey)) : npubEncode(pubkey)}`} class="hover:none {containerClass}">
		<Avatar class={avatarClass}>
			<AvatarImage src={profile?.image} alt={displayName} class={imageClass} />
			<AvatarFallback style={`background-color: ${hexColorFromPubkey}`} class={fallbackClass}>
				<span class="i-tdesign-user-1 w-8 h-8" />
			</AvatarFallback>
		</Avatar>
	</a>
{:else}
	<Avatar class={avatarClass}>
		<AvatarImage src={profile?.image} alt={displayName} class={imageClass} />
		<AvatarFallback style={`background-color: ${hexColorFromPubkey}`} class={fallbackClass}>
			<span class="i-tdesign-user-1 w-8 h-8" />
		</AvatarFallback>
	</Avatar>
{/if}
