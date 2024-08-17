<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let user: NDKUserProfile
</script>

<a href={`/p/${user.id}`}>
	<div class="py-1 flex flex-col items-center gap-2">
		<CAvatar pubkey={String(user.id)} profile={user} />
		<span class=" font-bold">{truncateString(user.name || user.displayName || npubEncode(String(user.id)))}</span>
	</div>
</a>
