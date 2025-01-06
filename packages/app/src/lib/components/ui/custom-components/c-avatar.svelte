<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte'
	import Avatar from '$lib/components/ui/avatar/avatar.svelte'
	import { getHexColorFingerprintFromHexPubkey, truncateString } from '$lib/utils'

	export let pubkey: string
	export let profile: NDKUserProfile | undefined | null
	export let linked = false
	export let containerClass = ''
	export let avatarClass = ''
	export let imageClass = ''
	export let fallbackClass = ''

	$: truncatedPubkey = truncateString(pubkey)
	$: hexColorFromPubkey = getHexColorFingerprintFromHexPubkey(pubkey)
	$: displayName = profile?.name || truncatedPubkey
</script>

{#if linked}
	<a href={`/p/${pubkey}`} class="hover:bg-accent rounded-none {containerClass}">
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
