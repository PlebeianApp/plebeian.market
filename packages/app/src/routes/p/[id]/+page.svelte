<script lang="ts">
	import StallItem from '$lib/components/stalls/item.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'

	/** @type {import('./$types').PageData} */
	export let data
	const { npub, name, image, products, stalls } = data
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<section class="w-fit">
					<a href="##" class="flex flex-col items-center">
						<Avatar class="h-20 w-20">
							<AvatarImage src={image} alt="@shadcn" />
							<AvatarFallback>{'Mohammad'}</AvatarFallback>
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
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Stalls</h2>
					<div
						class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
					>
						{#each stalls as item}
							<a href={`/stalls/${item.id}`}>
								<StallItem {item} />
							</a>
						{/each}
					</div>
				</div>
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each products as item}
								<a href={`/products/${item.id}`}>
									<ProductItem
										imageUrl={item.mainImage}
										productName={item.name}
										price={item.price}
										currency={item.currency}
									/>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
