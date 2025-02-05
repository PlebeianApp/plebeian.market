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
	import { getMediaType } from '$lib/utils/media.utils'
	import { Edit, MoreVertical } from 'lucide-svelte'

	import Spinner from '../assets/spinner.svelte'
	import { Badge } from '../ui/badge'
	import { Button } from '../ui/button'

	export let product: Partial<DisplayProduct>
	export let qtyPurchased: number | undefined = undefined

	let isMyProduct = false

	const stallCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindStalls}:${product.userId}:${product.stall_id}`)
	const productCoordinates: Partial<EventCoordinates> = parseCoordinatesString(`${KindProducts}:${product.userId}:${product.id}`)

	$: priceQuery = createCurrencyConversionQuery(String(product.currency), Number(product.price))
	$: isMyProduct = $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser.pubkey === product.userId : false
	let mediaLoadError = false
</script>

<Card.Root
	class="relative rounded-md flex flex-col border-2 border-black hover:border-primary transition-colors shadow-xl hover:shadow-2xl duration-200 text-black overflow-hidden"
>
	<a
		href={product.userNip05 ? `/products/${product.userNip05}/${product.identifier}` : `/products/${productCoordinates.coordinates}`}
		class="flex-shrink-0"
	>
		<Card.Header class="p-0">
			{#if product.images?.length && !mediaLoadError}
				{@const mainMedia = product.images?.sort((a, b) => a.imageOrder - b.imageOrder)[0]}
				<div class="relative w-full aspect-square">
					{#if getMediaType(mainMedia.imageUrl) === 'video'}
						<video
							class="absolute inset-0 w-full h-full object-cover"
							src={mainMedia.imageUrl}
							controls
							muted
							on:error={() => (mediaLoadError = true)}
						>
							<track kind="captions" />
						</video>
					{:else}
						<img
							class="absolute inset-0 w-full h-full object-cover"
							src={mainMedia.imageUrl}
							alt={product.name || 'Product image'}
							on:error={() => (mediaLoadError = true)}
						/>
					{/if}
				</div>
			{:else}
				<div class="flex items-center justify-center aspect-square">
					<span
						style={`color:${stringToHexColor(String(product.name || product.identifier))}`}
						class="i-mdi-package-variant-closed w-16 h-16"
					/>
				</div>
			{/if}
		</Card.Header>
	</a>

	<Card.Content class="p-1">
		<div class="flex items-start justify-between mb-2">
			<a
				href={product.userNip05 ? `/products/${product.userNip05}/${product.identifier}` : `/products/${productCoordinates.coordinates}`}
				class="flex-1"
			>
				<h3 class="text-sm font-bold line-clamp-2">{product.name}</h3>
			</a>

			{#if isMyProduct}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="ghost" builders={[builder]} size="icon" class="h-8 w-8 p-0 hover:bg-black/5 -mr-1">
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

	<Card.Footer class="p-1 mt-auto border-t border-black/10">
		<div class="flex flex-col gap-2 w-full">
			<div class="flex justify-between items-baseline">
				<div class="flex flex-col">
					{#if product.price && product.currency && !['sat', 'sats'].includes(product.currency.toLowerCase())}
						<span class="text-xs text-black/70">
							{product.price.toLocaleString('en-US')}
							{product.currency}
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
						<Badge variant={product.quantity && product.quantity > 0 ? 'secondary' : 'primary'} size="sm" class="text-xs">
							{product.quantity && product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
						</Badge>
					{/if}
				</div>
			</div>

			{#if !isMyProduct && product.userId && product.quantity && product.quantity > 0}
				<Button
					variant="primary"
					class="w-full text-sm h-8"
					on:click={() => handleAddToCart(String(product.userId), String(stallCoordinates.coordinates), product)}
				>
					Add to cart
				</Button>
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
