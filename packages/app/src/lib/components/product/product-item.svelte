<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { ProductCoordinatesType, StallCoordinatesType } from '$lib/stores/drawer-ui'
	import * as Card from '$lib/components/ui/card/index.js'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats, stringToHexColor } from '$lib/utils'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'
	import Separator from '../ui/separator/separator.svelte'

	export let product: Partial<DisplayProduct>
	export let qtyPurchased: number | undefined = undefined
	let { images, name, currency, price, userNip05, identifier, id, userId, quantity } = product

	let isMyProduct = false
	const stallCoordinates: StallCoordinatesType = !product.stallId?.startsWith(String(KindStalls))
		? (`${KindStalls}:${userId}:${product.stallId}` as StallCoordinatesType)
		: (product.stallId as StallCoordinatesType)
	const productCoordinates: ProductCoordinatesType = !id?.startsWith(String(KindProducts))
		? (`${KindProducts}:${userId}:${id}` as ProductCoordinatesType)
		: (id as ProductCoordinatesType)
	$: priceQuery = createCurrencyConversionQuery(String(currency), Number(price))
	$: isMyProduct = $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser.pubkey === userId : false
	let imageLoadError = false
</script>

<Card.Root class="relative grid grid-rows-[1fr_auto] border-2 border-black bg-transparent text-black group">
	{#if images?.length && !imageLoadError}
		{@const mainImage = images.find((img) => img.imageOrder === 0) || images[0]}
		<div class="relative flex items-center justify-center p-2">
			<img
				class="object-cover transition-opacity duration-300 group-hover:opacity-70"
				src={mainImage.imageUrl}
				alt=""
				on:error={() => (imageLoadError = true)}
			/>
		</div>
	{:else}
		<div class="flex items-center justify-center p-2">
			<span style={`color:${stringToHexColor(String(name || identifier))}`} class="i-mdi-package-variant-closed w-16 h-16" />
		</div>
	{/if}
	<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${productCoordinates}`}>
		<Card.Footer class="cursor-pointer">
			<div class="flex flex-col justify-between items-start w-full gap-2">
				<div class="flex-grow">
					<span class="text-sm truncate font-bold whitespace-normal">{name}</span>
				</div>
				<Separator></Separator>
				<div class="flex flex-col items-start">
					{#if price && currency && !['sat', 'sats'].includes(currency.toLowerCase())}
						<span class="text-xs">{price.toLocaleString('en-US')} {currency}</span>
					{:else if price && currency && currency.toLowerCase() == 'btc'}
						<span class="text-xs">{price.toLocaleString('en-US')} {currency}</span>
					{/if}
					<span class=" font-bold">
						{#if $priceQuery?.isLoading}
							<Spinner />
						{:else if typeof $priceQuery?.data === 'number' && !Number.isNaN($priceQuery.data)}
							{formatSats($priceQuery.data)}
							sats
						{:else}
							<i class="text-lg">price ({price} {currency}) could not be converted</i>
						{/if}
					</span>
					{#if qtyPurchased}
						<span class="text-xs">Quantity: {qtyPurchased}</span>
					{/if}
				</div>
			</div>
		</Card.Footer>
	</a>

	{#if isMyProduct}
		<div
			class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<Button
				on:click={() => openDrawerForProduct(productCoordinates, stallCoordinates)}
				class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				Edit product
			</Button>
		</div>
	{:else if userId}
		<Button
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			on:click={() => handleAddToCart(userId, stallCoordinates, product)}>Add to cart</Button
		>
	{/if}
</Card.Root>
