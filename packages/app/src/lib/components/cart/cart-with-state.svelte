<script lang="ts">
	import { cart } from '$lib/stores/cart'
	import { openDrawerForCart } from '$lib/stores/drawer-ui'
	import { derived } from 'svelte/store'

	import { Button } from '../ui/button'

	const totalProducts = derived(cart, ($cart) => Object.values($cart.products).reduce((total, product) => total + product.amount, 0))
</script>

<Button variant="primary" class="p-2 sm:flex relative" on:click={openDrawerForCart}>
	<span class="i-tdesign-cart w-6 h-6"></span>
	{#if $totalProducts > 0}
		<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
			{$totalProducts}
		</span>
	{/if}
</Button>
