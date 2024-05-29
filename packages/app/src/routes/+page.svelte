<script lang="ts">
	import { goto } from '$app/navigation'
	import CatCompactItem from '$lib/components/category/cat-compact-item.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData

	$: ({
		initialSetup,
		homeProducts: { featured, products },
		categoriesRes,
	} = data)

	onMount(() => {
		if (initialSetup) {
			goto('/setup')
		}
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<Pattern />
				<h1 class="relative z-10">Sell stuff for sats</h1>
				<Button class="relative z-10 p-6 text-xl font-bold">List my stuff</Button>
			</div>
			{#if featured.length}
				<div class=" bg-primary px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Featured Collections</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each featured as item}
								<ProductItem product={item} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
			<div class="py-5 lg:px-12">
				<div class="container">
					<h2>Categories</h2>
					<div class=" grid grid-cols-4 gap-2">
						{#each categoriesRes as cat}
							{#if cat.productCount}
								<CatCompactItem {cat} />
							{/if}
						{/each}
					</div>
				</div>
			</div>
			{#if products.length}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each products as item}
								<ProductItem product={item} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>
