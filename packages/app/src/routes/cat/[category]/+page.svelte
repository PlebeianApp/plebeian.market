<script lang="ts">
	import { page } from '$app/stores'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ stalls } = data)

	$: categoriesQuery = createCategoriesByFilterQuery({ category: $page.params.category })
	$: categoryData = $categoriesQuery.data?.[0]

	$: productsQuery = createProductsByFilterQuery({
		category: $page.params.catName,
		pageSize: 15,
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<Pattern />
				<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
				<h1 class="relative z-10">{categoryData?.name}</h1>
				<p>{categoryData?.description}</p>
			</div>
			{#if stalls.length}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<h2 class="relative z-10 flex gap-2 items-center justify-center">Stalls</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each stalls as stall}
								<StallItem {stall} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
			{#if $productsQuery.data}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<h2 class="relative z-10 flex gap-2 items-center justify-center">Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each $productsQuery.data as product}
								<ProductItem {product} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>
