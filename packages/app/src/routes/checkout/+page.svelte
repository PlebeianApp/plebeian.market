<script lang="ts">
	import Order from '$lib/components/cart/order.svelte'
	import CheckoutForm from '$lib/components/checkout-form.svelte'
	import { cart } from '$lib/stores/cart'

	let formData = {}

	function handleFormSubmit(event: CustomEvent) {
		formData = event.detail
	}
</script>

<h1>Checkout</h1>
<div class=" flex">
	<section>
		{#each Object.values($cart.users) as user (user.pubkey)}
			<Order {user} stalls={$cart.stalls} products={$cart.products} mode="checkout" {formData} />
		{/each}
	</section>
	<section>
		<CheckoutForm on:submit={handleFormSubmit} />
	</section>
</div>
