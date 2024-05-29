<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'
	import { createQuery } from '@tanstack/svelte-query'
	import CatItem from '$lib/components/category/cat-item.svelte'
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'

	$: catQuery = createQuery<RichCat[]>({
		queryKey: ['categories'],
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Categories</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#if $catQuery.isLoading}
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
						{:else if $catQuery.data}
							{#each $catQuery.data as cat}
								<CatItem category={cat} />
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
