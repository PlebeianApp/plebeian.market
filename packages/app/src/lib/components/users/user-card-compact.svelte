<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import Nip05Badge from '$lib/components/cart/nip-05-badge.svelte'
	import { getProfileName } from '$lib/utils/userProfile.utils'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	export let user: NDKUserProfile
	export let showNip05Badge: boolean = false
</script>

{#if user.id}
	<a href={`/p/${user.id}`}>
		<div class="py-1 flex flex-col items-center gap-2">
			<CAvatar pubkey={String(user.id)} profile={user} />
			<span class=" font-bold">{getProfileName(user, String(user.id))}</span>
			{#if showNip05Badge}
				<Nip05Badge userId={String(user.id)} />
			{/if}
		</div>
	</a>
{/if}
