<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import ProductItem from '$lib/components/product/item.svelte'
	import Pattern from '$lib/components/pattern.svg?url'
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<h1 class="mb-8 text-5xl font-bold">Sell stuff for sats</h1>
				<Button class="p-6 text-xl font-bold">List my stuff</Button>
				<div class="absolute top-0 h-full w-full" style={`background: url(${Pattern});`}></div>
			</div>
			<div class=" bg-primary px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Featured Collections</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>
			<div class=" px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Cool Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4, 5, 6] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>

			<div class=" bg-[#FFD53E] px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Events</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
