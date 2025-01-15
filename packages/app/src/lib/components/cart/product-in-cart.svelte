<script lang="ts">
	import type { CartProduct } from '$lib/stores/cart'
	import { formatPrice, stringToHexColor } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let product: CartProduct
	export let mode: 'review' | 'payment' = 'review'

	const dispatch = createEventDispatcher()

	const handleIncrement = () => {
		if (product.amount < product.stockQuantity) {
			dispatch('increment', { action: 'increment' })
		}
	}

	const handleDecrement = () => {
		if (product.amount > 1) {
			dispatch('decrement', { action: 'decrement' })
		}
	}

	const debouncedSetAmount = (newAmount: number) => {
		dispatch('setAmount', { action: 'setAmount', amount: newAmount })
	}

	function handleSetAmount(e: Event) {
		const newAmount = Math.min(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1), product.stockQuantity)
		debouncedSetAmount(newAmount)
	}

	function handleRemove() {
		dispatch('remove', { action: 'remove' })
		toast.success('Product removed from cart')
	}
</script>

<div class="flex flex-row h-18 justify-between my-4 gap-2 flex-wrap">
	{#if product.images && product.images.length > 0}
		{@const mainImage = product.images.find((img) => img.imageOrder === 0) || product.images[0]}

		<img class="contain h-[80px] aspect-square object-cover" src={mainImage.imageUrl} alt={product.name} />
	{:else}
		<div class="h-[80px] aspect-square flex items-center justify-center">
			<span style={`color:${stringToHexColor(String(product.name || product.id))}`} class="i-mdi-package-variant-closed w-10 h-10"></span>
		</div>
	{/if}
	<div class="flex flex-col flex-grow justify-between">
		<div class="font-bold">{product.name}</div>
		{#if mode === 'review'}
			<div class="flex flex-row justify-between">
				<div class="flex flex-row gap-1">
					<Button variant="outline" size="icon" on:click={handleDecrement} disabled={product.amount <= 1}>
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
				</div>
				<Button variant="ghost" on:click={handleRemove} size="icon">
					<span class="i-mdi-delete w-4 h-4"></span>
				</Button>
			</div>
		{:else if mode === 'payment'}
			<div>
				Amount: {product.amount}
			</div>
		{/if}
	</div>
	<div class="flex flex-col justify-between text-right">
		<div>{formatPrice(product.price * product.amount)}({product?.currency ?? product.currency})</div>
	</div>
</div>
