<script lang="ts">
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ImgPlaceHolder from '$lib/components/product/imgPlaceHolder.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { cn, currencyToBtc } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ product, seller, products } = data)

	let selectedImage = 0
</script>

<div class="container py-16">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="grid grid-cols-3 gap-6">
			<ul class="grid gap-4 md:col-span-1">
				{#if product.galleryImages.length}
					{#each product.galleryImages as item, i}
						<button
							class={cn('cursor-pointer p-1', i === selectedImage ? 'border border-primary' : null)}
							on:click={() => (selectedImage = i)}
						>
							<img src={item} alt="" />
						</button>
					{/each}
				{/if}
			</ul>
			{#if product.galleryImages.length}
				<img class="col-span-2 border-2 border-black p-1" src={product.galleryImages[selectedImage]} alt="" />
			{:else}
				<ImgPlaceHolder imageType={'main'} />
			{/if}
		</div>
		<div class="flex flex-col">
			<h1>{product.name}</h1>
			<h2 class=" inline-flex items-center">
				{#await currencyToBtc(product.currency, product.price, true)}
					<Spinner />
				{:then result}
					{result}
				{/await}
				sats
			</h2>
			<h3>${product.price} {product.currency}</h3>

			<h3 class="my-8 font-bold">Stock: {product.stockQty}</h3>
			<div class="flex w-1/2 flex-row gap-4">
				<Input class="border-2 border-black" type="number" value="1" min="1" max="5" />
				<Button>Add to cart</Button>
			</div>
			<span class="my-8 font-bold">Sold by <a href={`/p/${seller.id}`}><span class="underline">{seller.name}<span /></span></a> </span>
			<article>
				<h4 class="text-2xl font-bold">Details</h4>
				<p>
					{product.description}
				</p>
			</article>
		</div>
	</div>
</div>
<div class="container">
	<hr />
</div>

<div class="container py-20">
	<h2>More from {seller.name}</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
		{#each products as item}
			<a href={`/products/${item.id}`}>
				<ProductItem imageUrl={item.galleryImages[0]} productName={item.name} price={item.price} currency={item.currency} />
			</a>
		{/each}
	</div>
</div>
<div class="w-full bg-primary py-20 text-center text-white">
	<span class="mb-8 text-3xl text-black">Join in on the fun!</span>
	<h1 class="text-black">Sell stuff for sats</h1>
	<Button class="p-6 text-xl font-bold">List my stuff</Button>
</div>
