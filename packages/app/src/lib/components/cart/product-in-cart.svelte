<script lang="ts">
	import type { CartProduct } from '$lib/stores/cart'
	import { debounce, formatPrice, stringToHexColor } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let product: CartProduct
	export let mode: 'review' | 'payment' = 'review'

	const dispatch = createEventDispatcher()

	const handleIncrement = debounce(() => {
		if (product.amount < product.stockQuantity) {
			dispatch('increment', { action: 'increment' })
		}
	}, 200)

	const handleDecrement = debounce(() => {
		if (product.amount > 1) {
			dispatch('decrement', { action: 'decrement' })
		}
	}, 200)

	const debouncedSetAmount = debounce((newAmount) => {
		dispatch('setAmount', { action: 'setAmount', amount: newAmount })
	}, 500)

	function handleSetAmount(e: Event) {
		const newAmount = Math.min(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1), product.stockQuantity)
		debouncedSetAmount(newAmount)
	}

	function handleRemove() {
		dispatch('remove', { action: 'remove' })
		toast.success('Product removed from cart')
	}
</script>

<div class="flex flex-row h-18 justify-between my-4 gap-2">
	{#if product.images && product.images.length > 0 && product.images[0].imageUrl}
		<img class="contain h-[80px] aspect-square object-cover" src={product.images[0].imageUrl} alt={product.name} />
	{:else}
		<div class="h-[80px] aspect-square flex items-center justify-center">
			<span style={`color:${stringToHexColor(String(product.name || product.id))}`} class="i-mdi-package-variant-closed w-10 h-10"></span>
		</div>
	{/if}
	<div class="flex flex-col flex-grow justify-between">
		<div class="font-bold">{product.name}</div>
		{#if mode === 'review'}
			<div class="flex flex-row">
				<Button class="border-2 border-black" size="icon" variant="outline" on:click={handleDecrement} disabled={product.amount <= 1}>
					<span class="i-mdi-minus w-4 h-4"></span>
				</Button>
				<Input
					class="border-2 border-black w-16"
					type="number"
					value={product.amount}
					on:input={handleSetAmount}
					min="1"
					max={product.stockQuantity}
				/>
				<Button
					class="border-2 border-black"
					size="icon"
					variant="outline"
					on:click={handleIncrement}
					disabled={product.amount >= product.stockQuantity}
				>
					<span class="i-mdi-plus w-4 h-4"></span>
				</Button>
				<Button on:click={handleRemove} size="icon" variant="ghost">
					<span class="i-mdi-delete w-4 h-4"></span>
				</Button>
			</div>
		{:else if mode === 'payment'}
			<div>
				Amount: {product.amount}
			</div>
		{/if}
	</div>
	<div class="truncate flex flex-col justify-between text-right">
		<div>{formatPrice(product.price * product.amount)}({product?.currency ?? product.currency})</div>
	</div>
</div>
