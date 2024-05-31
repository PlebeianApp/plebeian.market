<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { stalls } = data
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h3>Categories</h3>
					<CatMenu />
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each stalls as item}
							<StallItem stall={item} />
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
