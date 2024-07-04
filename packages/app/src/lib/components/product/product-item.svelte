<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import { KindProducts } from '$lib/constants'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'
	import { addProduct } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'
	import ImgPlaceHolder from './imgPlaceHolder.svelte'

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

<Card.Root class="relative grid grid-rows-[1fr_auto] gap-4 border-4 border-black bg-transparent text-black group">
	{#if images}
		{@const mainImage = images[0]?.imageOrder ? images.find((image) => image.imageOrder == 0 || 1) : images[0]}

		<div class="relative">
			<img class="h-[329px] object-cover transition-opacity duration-300 group-hover:opacity-70" src={mainImage?.imageUrl} alt="" />
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
		<ImgPlaceHolder imageType={'thumbnail'} />
	{/if}
	<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${id}`}>
		<Card.Footer class="cursor-pointer flex flex-col gap-2 justify-end p-4 pb-2">
			<div>
				<span class="truncate font-bold whitespace-normal">{name}</span>
			</div>
			<div class=" inline-flex items-center gap-2 text-right">
				<span class="text-sm">{price} {currency}</span>
				<span class="font-bold">
					{#if $priceQuery.isLoading}
						<Spinner />
					{:else if $priceQuery.data}
						{$priceQuery.data}<small>sats</small>
					{/if}
				</span>
			</div>
		</Card.Footer>
	</a>
</Card.Root>
