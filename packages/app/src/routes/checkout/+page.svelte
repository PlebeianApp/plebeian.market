<script lang="ts">
	import GrandTotalDisplay from '$lib/components/cart/grand-total-display.svelte'
	import Order from '$lib/components/cart/order.svelte'
	import CheckoutForm from '$lib/components/checkout-form.svelte'
	import Stepper from '$lib/components/stepper.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import { cart } from '$lib/stores/cart'

	let currentStep = 0

	$: exampleSteps = [
		...Object.values($cart.users).map((user) => ({
			component: Order,
			props: {
				user,
				stalls: $cart.stalls,
				products: $cart.products,
				mode: 'checkout',
			},
		})),
		{
			component: CheckoutForm,
			props: {},
		},
		{
			component: GrandTotalDisplay,
			props: {},
		},
	]
</script>

<div class="container">
	<h2>Checkout</h2>
	<Stepper steps={exampleSteps} {currentStep} />

	<Button class="mt-6" disabled={currentStep === exampleSteps.length - 1} on:click={() => currentStep++}>Next Step</Button>
</div>
