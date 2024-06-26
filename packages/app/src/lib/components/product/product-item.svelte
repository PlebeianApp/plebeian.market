<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'
	import ImgPlaceHolder from './imgPlaceHolder.svelte'

	export let product: DisplayProduct
	const { galleryImages, name, currency, price, userNip05, identifier, id } = product

	let isMyProduct = false

	$: {
		const userId = $ndkStore.activeUser?.pubkey
		isMyProduct = userId === product.userId
	}

	$: priceQuery = createProductPriceQuery(product)
</script>

<Card.Root class="relative border-4 border-black bg-transparent text-black group">
	{#if galleryImages}
		{@const mainImage = galleryImages.find((image) => image.imageOrder == 0)}

		<div class="relative">
			<img class="h-[329px] object-cover transition-opacity duration-300 group-hover:opacity-70" src={mainImage?.imageUrl} alt="" />
			{#if isMyProduct}
				<Button
					on:click={() => openDrawerForProduct(id)}
					class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					Edit product
				</Button>
			{/if}
		</div>
	{:else}
		<ImgPlaceHolder imageType={'thumbnail'} />
	{/if}
	<Card.Footer class="cursor-pointer flex justify-end p-4">
		<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${id}`}>
			<span class="truncate font-bold">{name}</span>
			<div class="flex flex-col text-right">
				<span class="font-red font-bold">
					{#if $priceQuery.isLoading}
						<Spinner />
					{:else if $priceQuery.data}
						{$priceQuery.data}<small>sats</small>
					{/if}
				</span>
				<span class="text-sm">{price} {currency}</span>
			</div>
		</a>
	</Card.Footer>
</Card.Root>
