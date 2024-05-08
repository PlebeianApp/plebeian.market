<script lang="ts">
	import ProductItem from '$lib/components/product/item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ stall, user } = data)
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<section class="w-fit">
					<a href={`/p/${user.id}`} class="flex flex-col items-center">
						<Avatar>
							<AvatarImage src={user.image} alt="@shadcn" />
							<AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
						</Avatar>
						<span>{user.name}</span>
					</a>
				</section>
				<h1>{stall.name}</h1>
				<p class="text-2xl">{stall.description}</p>
			</div>
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each stall.products as item}
							<a href={`/products/${item.id}`}>
								<ProductItem imageUrl={item.galleryImages[0]} productName={item.name} price={item.price} currency={item.currency} />
							</a>
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
