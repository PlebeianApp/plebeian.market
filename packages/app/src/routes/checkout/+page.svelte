<script lang="ts">
	import GrandTotalDisplay from '$lib/components/cart/grand-total-display.svelte'
	import Order from '$lib/components/cart/order.svelte'
	import CheckoutForm from '$lib/components/checkout-form.svelte'
	import { cart } from '$lib/stores/cart'
	import Stepper from '$lib/components/stepper.svelte'

	const stepController = createStepController()
	let formData = {}

	function handleFormSubmit(event: CustomEvent) {
		formData = event.detail
	}
	let currentStep = 0

	// <div class="flex">
	// 	<section>
	// 		{#each Object.values($cart.users) as user (user.pubkey)}
	// 			<Order
	// 				{user}
	// 				stalls={$cart.stalls}
	// 				products={$cart.products}
	// 				mode="checkout"
	// 				{formData}
	// 				on:productUpdate={cart.handleProductUpdate}
	// 			/>
	// 		{/each}
	// 	</section>
	// 	<section>
	// 		<CheckoutForm on:submit={handleFormSubmit} />
	// 		<GrandTotalDisplay />
	// 	</section>
	// </div>
	// $: exampleSteps = [
	// 	...Object.values($cart.users).map((user) =>
	// 		makeStep({
	// 			component: Order,
	// 			props: {
	// 				user,
	// 				stalls: $cart.stalls,
	// 				products: $cart.products,
	// 				mode: 'checkout',
	// 				formData,
	// 				on: { productUpdate: cart.handleProductUpdate },
	// 			},
	// 		}),
	// 	),
	// 	makeStep({
	// 		component: CheckoutForm,
	// 		props: {
	// 			on: { submit: handleFormSubmit },
	// 		},
	// 	}),
	// 	makeStep({
	// 		component: GrandTotalDisplay,
	// 		props: {},
	// 	}),
	// ]
	// $: console.log(exampleSteps)
</script>

<div class="container">
	<h2>Checkout</h2>
	<button on:click={stepController.nextStep}>Next</button>
	<Stepper {currentStep}>
		<div slot="step-0">
			hello
		</div>
		<div slot="step-1">
			hi
		</div>
	</Stepper>
</div>
