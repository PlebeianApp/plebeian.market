<script lang="ts">
	import CatCompactItem from '$lib/components/category/cat-compact-item.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import { copyToClipboard } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ npub, name, image, products, stalls, categories } = data)
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<Pattern />
				<div class="w-fit z-10 justify-center">
					<div class="flex justify-center">
						<Avatar class="h-20 w-20">
							<AvatarImage src={image} alt="@shadcn" />
							<AvatarFallback>{name}</AvatarFallback>
						</Avatar>
					</div>
					<h2>{name}</h2>
					<div class="flex items-center">
						<Button variant="secondary" class="w-1/2 lg:w-auto">
							<code class="truncate">{npub}</code>
						</Button>
						<Button on:click={() => copyToClipboard(npub)}>Copy</Button>
					</div>
				</div>
			</div>
			{#if categories.length}
				<div class="py-5 lg:px-12">
					<div class="container">
						<h2>Categories</h2>
						<div class=" grid grid-cols-4 gap-2">
							{#each categories as cat}
								<CatCompactItem {cat} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
			{#if stalls.length}
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Stalls</h2>
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each stalls as item}
								<StallItem stall={item} />
							{/each}
						</div>
					</div>
				</div>
			{/if}

			{#if products.length}
				<div class="px-4 py-20 lg:px-12">
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
