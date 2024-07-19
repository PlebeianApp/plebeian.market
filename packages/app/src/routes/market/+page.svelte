<script lang="ts">
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { stallsSub } from '$lib/nostrSubs/subs'
	import { onDestroy } from 'svelte'

	stallsSub.ref()

	stallsSub.onEose(() => {
		console.log('Stalls sub EOSE')
	})

	onDestroy(() => {
		stallsSub.unref()
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#if $stallsSub.length}
							{#each $stallsSub as stall (stall?.id)}
								{#if stall}
									<StallItem stallData={stall} />
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
