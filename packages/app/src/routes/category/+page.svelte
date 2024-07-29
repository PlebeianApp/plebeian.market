<script lang="ts">
	import CatCompactItem from '$lib/components/category/cat-compact-item.svelte'
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'

	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize: 30 })
</script>

<div class="flex w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-8 lg:px-12">
				<div class="container">
					<h2>Categories</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#if $categoriesQuery.isLoading}
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
							<Skeleton class=" h-96 w-full" />
						{:else if $categoriesQuery.data}
							{#each $categoriesQuery.data.categories as cat}
								<CatCompactItem {cat} />
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
