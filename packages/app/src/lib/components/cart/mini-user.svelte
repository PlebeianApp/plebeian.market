<script lang="ts">
	import { createUserByIdQuery } from '$lib/fetch/users.queries'

	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '../ui/avatar/avatar-image.svelte'
	import Avatar from '../ui/avatar/avatar.svelte'
	import { Skeleton } from '../ui/skeleton'

	export let userId: string

	$: userQuery = createUserByIdQuery(userId)
</script>

<div>
	{#if $userQuery.isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{:else if $userQuery.data}
		<a href={`/p/${$userQuery.data.id}`}>
			<div class="py-1 flex flex-row items-center gap-2">
				<Avatar class="w-12 h-auto">
					<AvatarImage class="w-6 h-6" src={$userQuery.data.image} alt="@shadcn" />
					<AvatarFallback>{$userQuery.data.name}</AvatarFallback>
				</Avatar>
				<span class=" font-bold">{$userQuery.data.name}</span>
			</div>
		</a>
	{/if}
</div>
