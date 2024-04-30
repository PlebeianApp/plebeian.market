<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import ProductItem from '$lib/components/product/item.svelte'
	import Pattern from '$lib/components/pattern.svg?url'

	/** @type {import('./$types').PageData} */
	export let data
	const { featuresProducts, coolProducts, coolEvents } = data
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<h1>Sell stuff for sats</h1>
				<Button class="p-6 text-xl font-bold">List my stuff</Button>
				<div class="absolute top-0 h-full w-full" style={`background: url(${Pattern});`}></div>
			</div>
			<div class=" bg-primary px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Featured Collections</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each featuresProducts as item}
							<a href={`/products/${item.id}`}>
								<ProductItem imageUrl={item.mainImage} productName={item.name} price={item.price} />
							</a>
						{/each}
					</div>
				</div>
			</div>
			<div class=" px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Cool Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each coolProducts as item}
							<a href={`/products/${item.id}`}>
								<ProductItem imageUrl={item.mainImage} productName={item.name} price={item.price} />
							</a>
						{/each}
					</div>
				</div>
			</div>

			<div class=" bg-[#FFD53E] px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Events</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each coolEvents as item}
							<a href={`/products/${item.id}`}>
								<ProductItem imageUrl={item.mainImage} productName={item.name} price={item.price} />
							</a>
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
