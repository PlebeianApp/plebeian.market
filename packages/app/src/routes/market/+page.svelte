<script lang="ts">
	import Spinner from '$lib/components/assets/spinner.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { stallsSub } from '$lib/nostrSubs/subs'
	import { onDestroy, onMount } from 'svelte'
	import { derived } from 'svelte/store'

	const uniqueStallsStore = derived(stallsSub ?? [], ($stallsSub) => {
		if ($stallsSub.length <= 1) return $stallsSub

		const dTagSet = new Set($stallsSub.map((stall) => stall.dTag))
		if (dTagSet.size === $stallsSub.length) return $stallsSub

		return [...new Map($stallsSub.map((stall) => [stall.dTag, stall])).values()]
	})
	onMount(() => {
		if (!$stallsSub?.length) {
			stallsSub?.ref()
		}
	})
	onDestroy(() => {
		stallsSub?.unref()
	})
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 lg:px-12">
				<div class="container">
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#if $stallsSub?.length}
							{#each $uniqueStallsStore as stall (stall.dTag)}
								{#if stall}
									<StallItem stallData={stall} />
								{/if}
							{/each}
						{:else}
							<Spinner size={65} />
						{/if}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
