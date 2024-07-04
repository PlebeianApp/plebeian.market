<script lang="ts">
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { getProductAmount } from '$lib/stores/cart'
	import { formatPrice } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import ImgPlaceHolder from '../product/imgPlaceHolder.svelte'
	import SatPriceLoader from '../product/sat-price-loader.svelte'
	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let productId: string

	const dispatch = createEventDispatcher()

	$: product = createProductQuery(productId)

	$: currentAmount = getProductAmount(productId)

	const handleIncrement = () => {
		dispatch('increment')
	}

	const handleDecrement = () => {
		dispatch('decrement')
	}

	const handleSetAmount = (e) => {
		dispatch('setAmount', e.target.value)
	}

	const handleRemove = () => {
		dispatch('remove')
	}
</script>

<div>
	{#if $product.isLoading}
		<Spinner />
	{:else if $product.data}
		<div class="flex flex-row h-18 justify-between my-4 gap-2">
			{#if $product.data.images[0]}
				<img class="contain h-[80px] aspect-square object-cover" src={$product.data.images[0].imageUrl} alt="" />
			{:else}
				<ImgPlaceHolder imageType={'mini'} />
			{/if}
			<div class="flex flex-col flex-grow justify-between">
				<div class="font-bold">{$product.data.name}</div>

				<div class="flex flex-row">
					<Button class="border-2 border-black" size="icon" variant="outline" on:click={handleDecrement}>
						<span class="i-mdi-minus w-4 h-4"></span>
					</Button>
					<Input class="border-2 border-black w-16" type="number" value={$currentAmount} on:input={handleSetAmount} readonly />

					<Button class="border-2 border-black" size="icon" variant="outline" on:click={handleIncrement}>
						<span
							class="i-mdi-plus
                        w-4 h-4"
						></span>
					</Button>

					<Button on:click={handleRemove} size="icon" variant="ghost">
						<span class="i-mdi-delete w-4 h-4"></span>
					</Button>
				</div>
			</div>
			<div class="flex flex-col justify-between text-right">
				<SatPriceLoader factor={$currentAmount} product={$product.data} />
				<div>({$product.data.currency} {formatPrice($product.data.price * $currentAmount)})</div>
			</div>
		</div>
	{/if}
</div>
