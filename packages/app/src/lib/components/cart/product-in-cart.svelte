<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { fetchProductData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
	import { getProductAmount } from '$lib/stores/cart'
	import { checkIfProductExists, checkIfUserExists, formatPrice, stringToHexColor } from '$lib/utils'
	import { createEventDispatcher, onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import SatPriceLoader from '../product/sat-price-loader.svelte'
	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let productId: string

	const dispatch = createEventDispatcher()

	let productExist: boolean | undefined = undefined
	let productData: Partial<DisplayProduct> | null = null
	let isLoading = true

	$: productQuery = productExist !== undefined && productExist ? createProductQuery(productId) : undefined
	$: currentAmount = getProductAmount(productId)

	$: {
		if (productExist && $productQuery?.data) productData = $productQuery.data
		isLoading = productExist ? $productQuery?.isLoading ?? false : false
	}

	const handleIncrement = () => {
		if (productData && $currentAmount < (productData?.quantity ?? 0)) {
			dispatch('increment')
		}
	}

	const handleDecrement = () => {
		if ($currentAmount > 1) {
			dispatch('decrement')
		}
	}

	const handleSetAmount = (e) => {
		if (!productData) return
		const newAmount = Math.min(Math.max(1, parseInt(e.target.value) || 1), productData?.quantity ?? 0)
		dispatch('setAmount', newAmount)
	}

	const handleRemove = () => {
		dispatch('remove')
	}

	onMount(async () => {
		productExist = await checkIfProductExists(productId)
		if (!productExist) {
			const { nostrProduct } = await fetchProductData(productId, NDKSubscriptionCacheUsage.ONLY_CACHE)
			if (nostrProduct) {
				const result = await normalizeProductsFromNostr(nostrProduct, productId.split(':')[1])
				if (result && result.toDisplayProducts.length > 0) {
					productData = result.toDisplayProducts[0]
				}
			}
			isLoading = false
		}
	})
</script>

// product in cart

<div>
	{#if isLoading}
		<Spinner />
	{:else if productData}
		<div class="flex flex-row h-18 justify-between my-4 gap-2">
			{#if productData.images && productData.images[0]}
				<img class="contain h-[80px] aspect-square object-cover" src={productData.images[0].imageUrl} alt="" />
			{:else}
				<div class="h-[80px] aspect-square flex items-center justify-center">
					<span
						style={`color:${stringToHexColor(String(productData.name || productData.identifier))}`}
						class=" i-mdi-package-variant-closed w-10 h-10"
					></span>
				</div>
			{/if}
			<div class="flex flex-col flex-grow justify-between">
				<div class="font-bold">{productData.name}</div>

				<div class="flex flex-row">
					<Button class="border-2 border-black" size="icon" variant="outline" on:click={handleDecrement} disabled={$currentAmount <= 1}>
						<span class="i-mdi-minus w-4 h-4"></span>
					</Button>
					<Input
						class="border-2 border-black w-16"
						type="number"
						value={$currentAmount}
						on:input={handleSetAmount}
						min="1"
						max={productData.quantity}
						readonly
					/>
					<Button
						class="border-2 border-black"
						size="icon"
						variant="outline"
						on:click={handleIncrement}
						disabled={$currentAmount >= (productData?.quantity ?? 0)}
					>
						<span class="i-mdi-plus w-4 h-4"></span>
					</Button>
					<Button on:click={handleRemove} size="icon" variant="ghost">
						<span class="i-mdi-delete w-4 h-4"></span>
					</Button>
				</div>
			</div>
			<div class="flex flex-col justify-between text-right">
				<SatPriceLoader factor={$currentAmount} product={productData} />
				<div>({productData.currency} {formatPrice(productData?.price ?? 0 * $currentAmount)})</div>
			</div>
		</div>
	{:else}
		<div>Product not found</div>
	{/if}
</div>
