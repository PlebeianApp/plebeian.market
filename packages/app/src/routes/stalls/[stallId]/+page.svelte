<script>
	import * as Card from '$lib/components/ui/card/index.ts'
	import { Button } from '$lib/components/ui/button/index.ts'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.ts'
	import ProductItem from '$lib/components/product/item.svelte'
	/** @type {import('./$types').PageData} */
	export let data
	const { stall } = data
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="w-full bg-black py-20 text-center text-white">
				<h1 class="mb-8 text-5xl font-bold">{stall.name}</h1>
				<p class="text-2xl">{stall.description}</p>
			</div>
			<div class=" bg-primary px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">{stall.name}</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each stall.products as item}
							<ProductItem productName={item.name} />
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
