<script lang="ts">
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
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
	<main class="text-black pt-20">
		<div class="gap-16 pb-12">
			<div class="px-4 lg:px-12">
				<div class="mb-6">
					<h2>Nostr</h2>
					<h3 class="font-light">Here you can find all the stalls published on nostr</h3>
				</div>

				<ItemGrid title="Stalls" forItemType="stall">
					{#if $stallsSub?.length}
						{#each $uniqueStallsStore as stall (stall.dTag)}
							{#if stall}
								<StallItem stallData={stall} />
							{/if}
						{/each}
					{:else}
						<div class="flex justify-center w-full">
							<Spinner size={65} />
						</div>
					{/if}
				</ItemGrid>
			</div>
		</div>
	</main>
</div>
