<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import { stringToHexColor } from '$lib/utils'

	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '../ui/avatar/avatar-image.svelte'
	import Avatar from '../ui/avatar/avatar.svelte'

	export let user: NDKUserProfile
	const { image, name } = user
</script>

<a href={`/p/${user.id}`}>
	<div class="py-1 flex flex-col items-center gap-2">
		<Avatar class="w-12 h-12">
			<AvatarImage src={image} alt="@shadcn" />
			<AvatarFallback style={`background-color: ${stringToHexColor(String(name))}`}
				><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback
			>
		</Avatar>
		<span class=" font-bold">{name}</span>
	</div>
</a>
