<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { page } from '$app/stores'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { fetchUserProductData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
	import { onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import ImgPlaceHolder from './imgPlaceHolder.svelte'
	import SatPriceLoader from './sat-price-loader.svelte'

	const { activeUser, userExist } = $page.data

	export let stall: Partial<RichStall>
	let toDisplayProducts: Partial<DisplayProduct>[]

	$: productsByStall = userExist
		? createProductsByFilterQuery({
				stallId: stall.id,
			})
		: undefined

	$: {
		if ($productsByStall?.data) {
			toDisplayProducts = $productsByStall.data
		}
	}
	onMount(async () => {
		if (!activeUser?.id) return
		if (!userExist) {
			const { products: productsData } = await fetchUserProductData(activeUser.id)
			if (productsData) {
				const result = normalizeProductsFromNostr(productsData, activeUser.id as string, stall.id)
				if (result) {
					console.log(result)
					const { toDisplayProducts: _toDisplay } = result
					toDisplayProducts = _toDisplay
				}
			}
		}
	})
</script>

<div>
	{#if !toDisplayProducts?.length}
		<Spinner />
	{:else if toDisplayProducts.length}
		{#each toDisplayProducts as product}
			<a class="flex flex-row justify-between my-4 gap-2" href="/products/{product.id}">
				{#if product?.images?.length}
					<img class="contain h-[60px] aspect-square object-cover" src={product.images[0].imageUrl} alt="" />
				{:else}
					<ImgPlaceHolder imageType={'mini'} />
				{/if}
				<div class="flex flex-col flex-grow justify-between">
					<div>{product.name}</div>
					<div class="max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">{product.description}</div>
				</div>
				<div class="flex flex-col justify-between text-right">
					<SatPriceLoader {product} />
					<div>({product.currency} {product.price})</div>
				</div>
			</a>
			<Separator />
		{/each}
	{/if}
</div>
