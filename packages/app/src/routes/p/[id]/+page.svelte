<script lang="ts">
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
	import StallItem from '$lib/components/stalls/item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ npub, name, image, products, stalls } = data)
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<Pattern />
				<section class="w-fit z-10">
					<a href="##" class="flex flex-col items-center">
						<Avatar class="h-20 w-20">
							<AvatarImage src={image} alt="@shadcn" />
							<AvatarFallback>{name}</AvatarFallback>
						</Avatar>
					</a>
					<h2>{name}</h2>
					<div class="flex items-center justify-center">
						<Button variant="secondary" class="w-1/2 lg:w-auto">
							<code class="truncate">{npub}</code>
						</Button>
						<Button>Copy</Button>
					</div>
				</section>
			</div>
			{#if stalls.length}
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Stalls</h2>
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each stalls as item}
								<a href={`/stalls/${item.id}`}>
									<StallItem {item} />
								</a>
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
								<a href={`/products/${item.id}`}>
									<ProductItem imageUrl={item.galleryImages[0]} productName={item.name} price={item.price} currency={item.currency} />
								</a>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>
