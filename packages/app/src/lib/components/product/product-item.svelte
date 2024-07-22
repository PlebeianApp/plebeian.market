<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import { KindProducts } from '$lib/constants'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'
	import { addProduct } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor } from '$lib/utils'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'
	import Separator from '../ui/separator/separator.svelte'

	export let product: Partial<DisplayProduct>
	let { images, name, currency, price, userNip05, identifier, id, userId, quantity } = product

	let isMyProduct = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyProduct = $ndkStore.activeUser.pubkey === userId
		}
		if (!id?.startsWith(KindProducts.toString())) {
			id = `${KindProducts}:${userId}:${id}`
		}
	}
	$: priceQuery = createProductPriceQuery(product as DisplayProduct)
</script>

<Card.Root class="relative grid grid-rows-[1fr_auto] border-2 border-black bg-transparent text-black group">
	{#if images?.length}
		{@const mainImage = images[0]?.imageOrder ? images.find((image) => image.imageOrder == 0 || 1) : images[0]}

		<div class="relative">
			<div class=" flex items-center justify-center p-2">
				<img class="h-[329px] object-cover transition-opacity duration-300 group-hover:opacity-70" src={mainImage?.imageUrl} alt="" />
			</div>
			{#if isMyProduct}
				<Button
					on:click={() => openDrawerForProduct(id ? id : '')}
					class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					Edit product
				</Button>
			{:else}
				<Button
					on:click={() =>
						addProduct(userId, product.stallId, { id: id, name: name, amount: 1, price: price, stockQuantity: quantity }, currency)}
					class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					Add to cart
				</Button>
			{/if}
		</div>
	{:else}
		<div class="h-[329px] flex items-center justify-center p-2">
			<span style={`color:${stringToHexColor(String(name || identifier))}`} class=" i-mdi-package-variant-closed w-16 h-16"></span>
		</div>
	{/if}
	<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${id}`}>
		<Card.Footer class="cursor-pointer">
			<div class="flex flex-col justify-between items-start w-full gap-2">
				<div class="flex-grow">
					<span class="text-sm truncate font-bold whitespace-normal">{name}</span>
				</div>
				<Separator></Separator>
				<div class="flex flex-col items-start">
					{#if price && currency && !['sat', 'sats'].includes(currency.toLowerCase())}
						<span class="text-xs">{price.toLocaleString('en-US', { style: 'currency', currency: currency })} {currency}</span>
					{:else if price && currency && currency.toLowerCase() == 'btc'}
						<span class="text-xs">{price.toLocaleString('en-US', { style: 'currency', currency: currency })} {currency}</span>
					{/if}
					<span class=" font-bold">
						{#if $priceQuery?.isLoading}
							<Spinner />
						{:else if $priceQuery?.data}
							{$priceQuery.data.toLocaleString('en-US', {
								maximumFractionDigits: 2,
							})}
						{/if}
						sats
					</span>
				</div>
			</div>
		</Card.Footer>
	</a>
</Card.Root>
