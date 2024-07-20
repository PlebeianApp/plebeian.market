<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'

	import Button from '../ui/button/button.svelte'
	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	export let isExpanded: boolean = false
	let showMore = isExpanded
	let pageSize = 4

	let filteredCategories: RichCat[] = []
	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize: 30 })

	$: if ($categoriesQuery.data) filteredCategories = $categoriesQuery.data?.filter((cat) => (cat.productCount ?? 0) > 0) || []
</script>

{#if $categoriesQuery.isLoading}
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
{:else if filteredCategories.length}
	<h3>Categories</h3>
	<div class="flex flex-col">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="lg:px-12">
					<div class="container">
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
							{#each filteredCategories.slice(0, showMore ? filteredCategories.length : pageSize) as cat}
								<CatCompactItem {cat} />
							{/each}
						</div>
						{#if filteredCategories.length > pageSize}
							<div class=" text-center py-1">
								<Button on:click={() => (showMore = !showMore)} size="icon" class="cursor-pointer border-0" variant="ghost">
									{#if showMore}
										<span class=" i-tdesign-minus"></span>
									{:else}
										<span class=" i-tdesign-plus"></span>
									{/if}
								</Button>
							</div>
						{/if}
					</div>
				</div>
			</main>
		</div>
	</div>
{/if}
