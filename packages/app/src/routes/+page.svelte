<script lang="ts">
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { ndk } from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	onMount(async () => {
		await ndk.connect()

		const events = await ndk.fetchEvents({
			limit: 10,
			authors: ['9e77eabc6b7c575a619ab7ce235b3d99443ff33b8b9d805eacc5ec3a38a48976'],
		})
		console.log(events)
	})

	export let data: PageData
	const { featured, cool } = data
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
								<a href={`/products/${item.id}`}>
									<ProductItem imageUrl={item.galleryImages[0]} productName={item.name} price={item.price} currency={item.currency} />
								</a>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			{#if cool.length}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Cool Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each cool as item}
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
