<script lang="ts">
	import type { EventCoordinates } from '$lib/interfaces'
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats, parseCoordinatesString, stringToHexColor } from '$lib/utils'
	import { Edit, MoreVertical, ShoppingCart } from 'lucide-svelte' // Added icons

	import Spinner from '../assets/spinner.svelte'
	import { Badge } from '../ui/badge'
	import { Button } from '../ui/button'

	export let product: Partial<DisplayProduct>
	export let qtyPurchased: number | undefined = undefined
	let { images, name, currency, price, userNip05, identifier, id, userId, quantity } = product

	let isMyProduct = false

	const stallCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindStalls}:${userId}:${product.stall_id}`)
	const productCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindProducts}:${userId}:${id}`)

	$: priceQuery = createCurrencyConversionQuery(String(currency), Number(price))
	$: isMyProduct = $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser.pubkey === userId : false
	let imageLoadError = false
</script>

<Card.Root
	class="relative flex flex-col border-2 border-black hover:border-primary transition-colors duration-200 text-black overflow-hidden"
>
	<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${productCoordinates.coordinates}`} class="flex-shrink-0">
		<Card.Header class="p-0">
			{#if images?.length && !imageLoadError}
				{@const mainImage = images.find((img) => img.imageOrder === 0) || images[0]}
				<div class="relative aspect-[10/9]">
					<img
						class="object-cover w-full h-full"
						src={mainImage.imageUrl}
						alt={name || 'Product image'}
						on:error={() => (imageLoadError = true)}
					/>
				</div>
			{:else}
				<div class="flex items-center justify-center aspect-[10/9]">
					<span style={`color:${stringToHexColor(String(name || identifier))}`} class="i-mdi-package-variant-closed w-16 h-16" />
				</div>
			{/if}
		</Card.Header>
	</a>

	<Card.Content class="p-2 flex-1">
		<div class="flex items-start justify-between mb-2">
			<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${productCoordinates.coordinates}`} class="flex-1">
				<h3 class="text-sm font-bold line-clamp-2">{name}</h3>
			</a>

			{#if isMyProduct}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8 p-0 hover:bg-black/5 -mr-1">
							<MoreVertical class="h-5 w-5" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="min-w-[8rem]">
						<DropdownMenu.Item
							class="cursor-pointer"
							on:click={() => openDrawerForProduct(String(productCoordinates.coordinates), String(stallCoordinates.coordinates))}
						>
							<Edit class="mr-2 h-4 w-4" />
							<span>Edit product</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</Card.Content>

	<Card.Footer class="p-2 mt-auto border-t border-black/10">
		<div class="flex flex-col gap-2 w-full">
			<div class="flex justify-between items-baseline">
				<div class="flex flex-col">
					{#if price && currency && !['sat', 'sats'].includes(currency.toLowerCase())}
						<span class="text-xs text-black/70">
							{price.toLocaleString('en-US')}
							{currency}
						</span>
					{/if}
					<span class="font-bold text-sm">
						{#if $priceQuery?.isLoading}
							<Spinner />
						{:else if typeof $priceQuery?.data === 'number' && !Number.isNaN($priceQuery.data)}
							{formatSats($priceQuery.data)} sats
						{:else}
							<i class="text-xs">Price unavailable</i>
						{/if}
					</span>
				</div>

				<div>
					{#if qtyPurchased}
						<Badge variant="outline" class="text-xs">
							purchased: {qtyPurchased}
						</Badge>
					{:else}
						<Badge variant={quantity && quantity > 0 ? 'outline' : 'default'} class="text-xs">
							{quantity && quantity > 0 ? `${quantity} in stock` : 'Out of stock'}
						</Badge>
					{/if}
				</div>
			</div>

			{#if !isMyProduct && userId && quantity && quantity > 0}
				<Button
					variant="outline"
					class="w-full text-sm h-8"
					on:click={() => handleAddToCart(userId, String(stallCoordinates.coordinates), product)}
				>
					<ShoppingCart class="h-4 w-4 mr-2" />
					Add to cart
				</Button>
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
