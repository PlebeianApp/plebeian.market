<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte'
	import Avatar from '$lib/components/ui/avatar/avatar.svelte'
	import { getHexColorFingerprintFromHexPubkey, truncateString } from '$lib/utils'

	export let pubkey: string
	export let profile: NDKUserProfile | undefined | null
	const truncatedPubkey = truncateString(pubkey)
	const hexColorFromPubkey = getHexColorFingerprintFromHexPubkey(pubkey)
</script>

<Avatar>
	<AvatarImage src={profile?.image} alt={profile?.name || truncatedPubkey} />
	<AvatarFallback style={`background-color: ${hexColorFromPubkey}`}><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback>
</Avatar>
