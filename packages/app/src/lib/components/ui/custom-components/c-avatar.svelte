<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte'
	import Avatar from '$lib/components/ui/avatar/avatar.svelte'
	import { getHexColorFingerprintFromHexPubkey, truncateString } from '$lib/utils'

	export let pubkey: string
	export let profile: NDKUserProfile | undefined | null
	export let linked: boolean = false

	const truncatedPubkey = truncateString(pubkey)
	const hexColorFromPubkey = getHexColorFingerprintFromHexPubkey(pubkey)
</script>

{#if linked}
	<a href={`/p/${pubkey}`} class="hover:bg-accent rounded-none">
		<Avatar>
			<AvatarImage src={profile?.image} alt={profile?.name || truncatedPubkey} />
			<AvatarFallback style={`background-color: ${hexColorFromPubkey}`}><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback>
		</Avatar>
	</a>
{:else}
	<Avatar>
		<AvatarImage src={profile?.image} alt={profile?.name || truncatedPubkey} />
		<AvatarFallback style={`background-color: ${hexColorFromPubkey}`}><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback>
	</Avatar>
{/if}
