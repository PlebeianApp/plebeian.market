<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import AuthDialog from '$lib/components/dialogs/authDialog.svelte'
    import ItemGrid from '$lib/components/common/item-grid.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { dialogs } from '$lib/stores/dialog'
	import { openDrawerForNewProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import type { PageData } from './$types'

	export let data: PageData

	$: productQuery = createProductsByFilterQuery({ pageSize: 8, order: 'asc' })
	$: featuredProductsQuery = createProductsByFilterQuery({ featured: true })

	function handleSelling() {
		if (!$ndkStore.activeUser) dialogs.show(AuthDialog)
		else openDrawerForNewProduct()
	}
</script>

{#if !data.appSettings?.isFirstTimeRunning}
	<div class="flex min-h-screen w-full flex-col relative">
		<div
			class="absolute inset-0 opacity-40 -z-10"
			style="background: url(/page-min.png); background-repeat: repeat; background-size: auto; background-position: center;"
		/>
		<div class="flex flex-col">
			<main class="text-black">
				<div class="relative w-full bg-black py-20 text-center text-white overflow-hidden">
					<div
						class="absolute inset-x-0 -bottom-18 h-full bg-[radial-gradient(ellipse_at_bottom,var(--secondary)_25%,transparent_70%)] opacity-30 blur-2xl"
					></div>

					<Pattern />
					<h1 class="relative z-10">Sell stuff for sats</h1>
					<Button variant="focus" class="relative z-10" on:click={handleSelling}>
						<span class="flex items-center gap-2">
							<span class="i-game-icons-ostrich w-5 h-5"></span>Start Selling
						</span>
					</Button>
				</div>
				<div class="gap-16 pb-12">
					{#if $featuredProductsQuery.data?.products?.length}
						<ItemGrid title="Featured Collections">
							{#each $featuredProductsQuery.data?.products as item (item.id)}
								<ProductItem product={item} />
							{/each}
						</ItemGrid>
					{/if}
					<div class="py-5 lg:px-12">
						<CatMenu />
					</div>
					{#if $productQuery.data?.products?.length}
						<ItemGrid title="Products">
							{#each $productQuery.data?.products as item (item.id)}
								<ProductItem product={item} />
							{/each}
						</ItemGrid>
						<div class="flex justify-center">
							<Button variant="primary" class="mt-6 p-4 font-bold w-1/3" href="/products">Explore products</Button>
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
