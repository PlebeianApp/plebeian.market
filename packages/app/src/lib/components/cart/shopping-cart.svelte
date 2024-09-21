<script lang="ts">
	import { goto } from '$app/navigation'
	import { cart } from '$lib/stores/cart'
	import { closeDrawer } from '$lib/stores/drawer-ui'

	import Button from '../ui/button/button.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import GrandTotalDisplay from './grand-total-display.svelte'
	import Order from './order.svelte'

	function clearCart() {
		cart.clear()
	}
</script>

<div class="flex flex-col flex-grow overflow-hidden">
	<div class="flex-grow overflow-hidden">
		<ScrollArea class="h-full pr-4">
			<section class="flex flex-col gap-4">
				{#each Object.values($cart.users) as user (user.pubkey)}
					<Order {user} stalls={$cart.stalls} products={$cart.products} mode="cart" on:productUpdate={cart.handleProductUpdate} />
				{/each}
			</section>
		</ScrollArea>
	</div>
	<div class="flex-shrink-0">
		<GrandTotalDisplay showActions={true}>
			<div slot="actions" class="flex justify-between mt-4">
				<Button variant="outline" on:click={clearCart}>Clear Cart</Button>
				<Button
					on:click={() => {
						goto('/checkout')
						closeDrawer()
					}}>Proceed to Checkout</Button
				>
			</div>
		</GrandTotalDisplay>
	</div>
</div>
