<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'

	import type { PageData } from './$types'

	export let data: PageData

	$: productQuery = createProductsByFilterQuery({ pageSize: 8, order: 'asc' })
	$: featuredProductsQuery = createProductsByFilterQuery({ featured: true })
</script>

{#if !data.appSettings?.isFirstTimeRunning}
	<div class="flex min-h-screen w-full flex-col">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="relative w-full bg-black py-20 text-center text-white">
					<Pattern />
					<h1 class="relative z-10">Sell stuff for sats</h1>
				</div>
				<div class="container">
					{#if $featuredProductsQuery.data?.products?.length}
						<div class="bg-primary px-4 py-20 lg:px-12">
							<div>
								<h2>Featured Collections</h2>
								<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
									{#each $featuredProductsQuery.data?.products as item (item.id)}
										<ProductItem product={item} />
									{/each}
								</div>
							</div>
						</div>
					{/if}
					<div class="py-5 lg:px-12">
						<CatMenu />
					</div>
					{#if $productQuery.data?.products?.length}
						<div class=" px-4 py-20 lg:px-12">
							<h2>Products</h2>
							<div class=" flex flex-col items-center">
								<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
									{#each $productQuery.data?.products as item (item.id)}
										<ProductItem product={item} />
									{/each}
								</div>
								<Button variant="primary" class="mt-6 p-4 font-bold" href="/products">Explore products</Button>
							</div>
						</div>
					{:else}
						<div class=" px-4 py-20 lg:px-12">
							<div class=" flex flex-col items-center">
								<h2>No products yet...</h2>
							</div>
						</div>
					{/if}
				</div>
			</main>
		</div>
	</div>
{/if}
