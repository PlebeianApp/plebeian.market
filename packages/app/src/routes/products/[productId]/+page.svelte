<script>
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import ProductItem from '$lib/components/product/item.svelte'

	/** @type {import('./$types').PageData} */
	export let data
	const { product, seller, sellersProducts } = data
</script>

<div class="container py-16">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="grid grid-cols-3 gap-6">
			<ul class="grid gap-4 md:col-span-1">
				<li>
					<img class="border-2 border-primary p-1" src={product.mainImage} alt="" />
				</li>
				{#each product.galleryImages as item}
					<li>
						<img src={item} alt="" />
					</li>
				{/each}
			</ul>
			<img class="col-span-2 border-2 border-black p-1" src={product.mainImage} alt="" />
		</div>
		<div class="flex flex-col">
			<h1>{product.name}</h1>
			<h2>224,255 sats</h2>
			<h3>${product.price} {product.currency}</h3>

			<h3 class="my-8 font-bold">Stock: 5</h3>
			<div class="flex w-1/2 flex-row gap-4">
				<Input class="border-2 border-black" type="number" value="1" min="1" max="5" />
				<Button>Add to cart</Button>
			</div>
			<span class="my-8 font-bold"
				>Sold by <a href={`/p/${seller.id}`}><span class="underline">{seller.name}<span /></span></a
				>
			</span>
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
	<h2>More from BTC Hardware Solutions</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
		{#each sellersProducts as item}
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
<div class="w-full bg-primary py-20 text-center text-white">
	<span class="mb-8 text-3xl text-black">Join in on the fun!</span>
	<h1 class="text-black">Sell stuff for sats</h1>
	<Button class="p-6 text-xl font-bold">List my stuff</Button>
</div>
