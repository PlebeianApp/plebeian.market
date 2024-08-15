<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let user: NDKUserProfile
	const { name } = user
</script>

<a href={`/p/${user.id}`}>
	<div class="py-1 flex flex-col items-center gap-2">
		<CAvatar pubkey={String(user.id)} profile={user} />
		<span class=" font-bold">{name}</span>
	</div>
</a>
