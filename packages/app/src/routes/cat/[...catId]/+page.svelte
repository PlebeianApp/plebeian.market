<script lang="ts">
	import type { ProductsFilter } from '$lib/schema'
	import type { RichCat } from '$lib/server/categories.service'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createQuery } from '@tanstack/svelte-query'
	import { page } from '$app/stores'
	import { GETAllProducts, GETCatById } from '$lib/apiUtils'
	import CatItem from '$lib/components/category/cat-item.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { productsFilterSchema } from '$lib/schema'

	import type { Product } from '@plebeian/database'

	import type { PageData } from './$types'

	// TODO Display products and stalls by cat id

	$: catQuery = createQuery<RichCat>({
		queryKey: ['categories', $page.params.catId],
		queryFn: async () => {
			const filter = { catId: $page.params.catId }
			const res = await GETCatById([filter.catId])
			return res.json()
		},
	})
	$: productsQuery = createQuery<DisplayProduct[]>({
		queryKey: ['products'],
		queryFn: async () => {
			const filter: ProductsFilter = productsFilterSchema.parse({ catId: $page.params.catId })
			const res = await GETAllProducts(filter)
			return res.json()
		},
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<Pattern />
				<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
				<h1 class="relative z-10">{$catQuery.data?.name}</h1>
				<p>{$catQuery.data?.description}</p>
			</div>
			{#if $catQuery.data}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							<CatItem category={$catQuery.data} />
						</div>
					</div>
				</div>
			{/if}
			{#if $productsQuery.data}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
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
