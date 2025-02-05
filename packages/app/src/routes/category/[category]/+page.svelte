<script lang="ts">
	import { page } from '$app/stores'
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import Hero from '$lib/components/common/hero.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ stalls } = data)

	$: categoriesQuery = createCategoriesByFilterQuery({ category: $page.params.category })
	$: categoryData = $categoriesQuery.data?.categories[0]

	$: productsQuery = createProductsByFilterQuery({
		pageSize: getGridColumns($breakpoint, 'product') * 4,
		category: $page.params.category,
	})
</script>

<!-- Hiding hero but keeping incase of return
<Hero>
	<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
	<h1 class="relative z-10">{categoryData?.name}</h1>
</Hero>
-->
<CatMenu />
<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col gap-2 relative mx-4">
		{#if $productsQuery.data?.products}
			<ItemGrid title="{categoryData?.name}">
				{#each $productsQuery?.data.products as product}
					<ProductItem {product} />
				{/each}
			</ItemGrid>
		{/if}
		{#if stalls.length}
			<ItemGrid title="Shops" forItemType="stall">
				{#each stalls as stall}
					<StallItem stallData={stall} />
				{/each}
			</ItemGrid>
		{/if}
	</div>
</div>
