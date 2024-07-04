<script lang="ts">
	import { getTotalAmounts, initializeCart } from '$lib/stores/cart'
	import { openDrawerForCart } from '$lib/stores/drawer-ui'

	import { Button } from '../ui/button'

	$: ({ totalAmountItems } = $getTotalAmounts)

	initializeCart()
</script>

<Button class="p-2 hidden sm:flex relative" on:click={openDrawerForCart}>
	<span class="i-tdesign-cart text-black w-6 h-6"></span>
	{#if totalAmountItems > 0}
		<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
			{totalAmountItems}
		</span>
	{/if}
</Button>
