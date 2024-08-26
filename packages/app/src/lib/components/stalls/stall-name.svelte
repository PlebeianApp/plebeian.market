<script lang="ts">
	import { createStallQuery } from '$lib/fetch/stalls.queries'

	import Skeleton from '../ui/skeleton/skeleton.svelte'

	export let stallId: string
	$: stallQuery = createStallQuery(stallId)
</script>

<div class="flex flex-col justify-between gap-2">
	{#if $stallQuery.isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{:else if $stallQuery.data}
		<a href={`/stalls/${stallId}`} class="flex flex-row gap-1">
			<span class="i-tdesign-store w-6 h-6" />
			<span>{$stallQuery.data.stall?.name}</span>
		</a>
	{:else}
		<div>Stall not found</div>
	{/if}
</div>
