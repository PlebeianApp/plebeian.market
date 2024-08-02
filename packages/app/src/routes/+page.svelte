<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import Chat from '$lib/components/chat.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { openDrawerForNewStall } from '$lib/stores/drawer-ui'

	import type { PageData } from './$types'

	export let data: PageData

	$: ({
		homeProducts: { featured, products },
		appSettings: { isFirstTimeRunning },
	} = data)
</script>

{#if !isFirstTimeRunning}
	<div class="flex min-h-screen w-full flex-col">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="relative w-full bg-black py-20 text-center text-white">
					<Pattern />
					<h1 class="relative z-10">Sell stuff for sats</h1>
					<Button class="relative z-10 p-6 text-xl font-bold" on:click={openDrawerForNewStall}>List my stuff</Button>
				</div>
				{#if featured?.length}
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
				<div class="container max-w-[700px]">
					<Chat />
					<div>
						<div class="py-5 lg:px-12">
							<div class="container">
								<CatMenu />
							</div>
						</div>
						{#if products?.length}
							<div class=" px-4 py-20 lg:px-12">
								<div class="container flex flex-col items-center">
									<h2>Products</h2>
									<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
										{#each products as item}
											<ProductItem product={item} />
										{/each}
									</div>
									<Button class="mt-6 p-4 font-bold" href="/products">Explore products</Button>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</main>
		</div>
	</div>
{/if}
