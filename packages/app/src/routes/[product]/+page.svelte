<script>
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
</script>

<div class="container py-16">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="grid grid-cols-3 gap-6">
			<ul class="grid gap-4 md:col-span-1">
				<li>
					<img
						class="border-2 border-primary p-1"
						src="https://searxng.ca/image_proxy?url=https%3A%2F%2Fwww.gearpatrol.com%2Fwp-content%2Fuploads%2Fsites%2F2%2F2023%2F09%2Fbest-vintage-film-cameras-refresh-lead-650de2dd54d04-jpg.webp&h=1367be0e2d2f2e23da02bc653c0fcd4867a26a8e426e32a8eb5bc7f9eb21ddb3"
						alt=""
					/>
				</li>
				{#each [1, 2, 3, 4] as item}
					<li>
						<img
							src="https://searxng.ca/image_proxy?url=https%3A%2F%2Fwww.gearpatrol.com%2Fwp-content%2Fuploads%2Fsites%2F2%2F2023%2F09%2Fbest-vintage-film-cameras-refresh-lead-650de2dd54d04-jpg.webp&h=1367be0e2d2f2e23da02bc653c0fcd4867a26a8e426e32a8eb5bc7f9eb21ddb3"
							alt=""
						/>
					</li>
				{/each}
			</ul>
			<img
				class="col-span-2 border-2 border-black p-1"
				src="https://searxng.ca/image_proxy?url=https%3A%2F%2Fwww.gearpatrol.com%2Fwp-content%2Fuploads%2Fsites%2F2%2F2023%2F09%2Fbest-vintage-film-cameras-refresh-lead-650de2dd54d04-jpg.webp&h=1367be0e2d2f2e23da02bc653c0fcd4867a26a8e426e32a8eb5bc7f9eb21ddb3"
				alt=""
			/>
		</div>
		<div class="flex flex-col">
			<h1 class="mb-8 text-3xl font-bold">Premium Aluminum SeedSigner (Orange)</h1>
			<h2 class="text-2xl font-bold">224,255 sats</h2>
			<h3 class="">$150 USD</h3>

			<h3 class="my-8 font-bold">Stock: 5</h3>
			<div class="flex w-1/2 flex-row gap-4">
				<Input class="border-2 border-black" type="number" value="1" min="1" max="5" />
				<Button>Add to cart</Button>
			</div>
			<span class="my-8 font-bold"
				>Sold by <span class="underline">BTC Hardware Solutions<span /></span>
			</span>
			<article>
				<h4 class="text-2xl font-bold">Details</h4>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nemo labore possimus corporis
					maiores nam odio harum quae repellat facilis, tempore aut nulla perspiciatis qui iure sint
					voluptates. Hic, eius animi!
				</p>
			</article>
		</div>
	</div>
</div>
<div class="container">
	<hr />
</div>

<div class="container py-20">
	<h2 class="mb-4 text-2xl font-bold">More from BTC Hardware Solutions</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
		{#each [1, 2, 3, 4] as item}
			<ProductItem />
		{/each}
	</div>
</div>
<div class="w-full bg-primary py-20 text-center text-white">
	<span class="mb-8 text-3xl text-black">Join in on the fun!</span>
	<h1 class="my-8 text-5xl font-bold text-black">Sell stuff for sats</h1>
	<Button class="p-6 text-xl font-bold">List my stuff</Button>
</div>
