<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'

	import Button from '../ui/button/button.svelte'

	export let merchant: CartUser
</script>

<div class="w-1/2 mx-auto flex flex-col gap-4">
	<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="cart" on:productUpdate={cart.handleProductUpdate} />
	<div class="flex justify-between gap-4">
		<Button variant="ghost" class="w-full">Order</Button>
		<Button
			class="w-full"
			on:click={() => {
				currentStep.set($currentStep + 1)
			}}>Order & Pay</Button
		>
	</div>
</div>
