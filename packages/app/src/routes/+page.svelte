<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import Hero from '$lib/components/common/hero.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'
	import ndkStore from '$lib/stores/ndk'
	import { handleListItems } from '$lib/utils/product.utils'
	import { MetaTags } from 'svelte-meta-tags'

	import type { PageData } from './$types'

	export let data: PageData
	const { pageMetaTags } = data

	$: userStalls = $ndkStore.activeUser?.pubkey ? createStallsByFilterQuery({ userId: $ndkStore.activeUser.pubkey }) : undefined
	$: if ($userStalls != undefined && $userStalls?.data == null) $userStalls?.refetch()
	$: startSellingText = $userStalls === undefined ? 'Start Selling' : !$userStalls?.data?.stalls.length ? 'Open a shop' : 'Sell a product'
	$: productQuery = createProductsByFilterQuery({ pageSize: getGridColumns($breakpoint, 'product') * 4, order: 'asc', onePerUser: true })
	$: featuredProductsQuery = createProductsByFilterQuery({ featured: true, pageSize: getGridColumns($breakpoint, 'product') * 4 })
</script>

<MetaTags {...pageMetaTags} />

{#if !data.appSettings?.isFirstTimeRunning}
	<div class="flex min-h-screen w-full flex-col relative">
		<main class="text-black">
			<Hero>
				<div class="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 mb-6 p-2">
					<img src="/buy-sell.svg" alt="Buy Sell Stuff for Sats" class="lg:h-[45px] w-auto" />
					<img src="/stuff-for-sats.svg" alt="Buy Sell Stuff for Sats" class="lg:h-[45px] w-auto" />
				</div>
				<Button variant="focus" class="relative z-10" on:click={handleListItems}>
					<span class="flex items-center gap-2">
						<span class="i-game-icons-ostrich w-5 h-5"></span>{startSellingText}
					</span>
				</Button>
			</Hero>
			<CatMenu />
			<div class="gap-16 pb-12">
				<div class="my-8 mx-4">
					{#if $featuredProductsQuery.data?.products?.length}
						<ItemGrid title="Featured">
							{#each $featuredProductsQuery.data?.products as item (item.id)}
								<ProductItem product={item} />
							{/each}
						</ItemGrid>
					{/if}
					{#if $productQuery.data?.products?.length}
						<ItemGrid title="Products">
							{#each $productQuery.data?.products as item (item.id)}
								<ProductItem product={item} />
							{/each}
						</ItemGrid>
						<div class="flex justify-center">
							<Button variant="primary" class="mt-6 p-4 font-bold lg:w-1/3" href="/products">Explore products</Button>
						</div>
					{:else}
						<div class=" px-4 py-20 lg:px-12">
							<div class=" flex flex-col items-center">
								<h2>No products yet...</h2>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
{/if}
