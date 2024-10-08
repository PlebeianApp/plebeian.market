<script lang="ts">
	import type { EventCoordinates } from '$lib/interfaces'
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats, parseCoordinatesString, stringToHexColor } from '$lib/utils'

	import Spinner from '../assets/spinner.svelte'
	import { Badge } from '../ui/badge'
	import { Button } from '../ui/button'
	import Separator from '../ui/separator/separator.svelte'

	export let product: Partial<DisplayProduct>
	export let qtyPurchased: number | undefined = undefined
	let { images, name, currency, price, userNip05, identifier, id, userId, quantity } = product

	let isMyProduct = false

	const stallCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindStalls}:${userId}:${product.stallId}`)
	const productCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindProducts}:${userId}:${id}`)

	$: priceQuery = createCurrencyConversionQuery(String(currency), Number(price))
	$: isMyProduct = $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser.pubkey === userId : false
	let imageLoadError = false
</script>

<Card.Root class="relative grid grid-rows-[1fr_auto] border-2 border-black bg-transparent text-black group">
	<Card.CardContent class="p-2">
		{#if images?.length && !imageLoadError}
			{@const mainImage = images.find((img) => img.imageOrder === 0) || images[0]}
			<div class="relative flex items-center justify-center aspect-[10/9] mt-1">
				<img class="object-cover w-full h-full" src={mainImage.imageUrl} alt="" on:error={() => (imageLoadError = true)} />
			</div>
		{:else}
			<div class="flex items-center justify-center min-h-64 h-full">
				<span style={`color:${stringToHexColor(String(name || identifier))}`} class="i-mdi-package-variant-closed w-16 h-16" />
			</div>
		{/if}
	</Card.CardContent>
	<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${productCoordinates}`}>
		<Card.Footer class="cursor-pointer">
			<div class="flex flex-col justify-between items-start w-full gap-2">
				<div class="flex-grow">
					<span class="text-sm truncate font-bold whitespace-normal">{name}</span>
				</div>
				<Separator></Separator>
				<div class="flex flex-row justify-between w-full items-end">
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
					</div>
					<div>
						{#if qtyPurchased}
							<Badge variant="outline">purchased: {qtyPurchased}</Badge>
						{:else}
							<Badge variant={quantity && quantity > 0 ? 'outline' : 'default'}
								>{quantity && quantity > 0 ? `${quantity} in stock` : 'Out of stock'}</Badge
							>
						{/if}
					</div>
				</div>
			</div>
		</Card.Footer>
	</a>

	{#if isMyProduct}
		<div
			class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<Button
				on:click={() => openDrawerForProduct(String(productCoordinates.coordinates), String(stallCoordinates.coordinates))}
				class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				Edit product
			</Button>
		</div>
	{:else if userId}
		{#if quantity && quantity > 0}
			<Button
				class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				on:click={() => handleAddToCart(userId, String(stallCoordinates.coordinates), product)}
			>
				Add to cart
			</Button>
		{/if}
	{/if}
</Card.Root>
