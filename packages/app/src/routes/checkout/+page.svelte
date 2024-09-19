<script lang="ts">
	import type { Step } from '$lib/components/checkout/types'
	import Order from '$lib/components/checkout/order.svelte'
	import Pay from '$lib/components/checkout/pay.svelte'
	import Review from '$lib/components/checkout/review.svelte'
	import Success from '$lib/components/checkout/success.svelte'
	import Stepper from '$lib/components/stepper.svelte'
	import { cart } from '$lib/stores/cart'
	import { checkoutFormStore, currentStep } from '$lib/stores/checkout'
	import { onDestroy } from 'svelte'

	$: hasMultipleUsers = Object.keys($cart.users).length > 1

	let checkoutSteps: Step[]

	$: checkoutSteps = [
		{
			component: Review,
			props: {},
		},
		...Object.values($cart.users).flatMap((user) => [
			{
				component: Order,
				props: { merchant: user },
			},
			{
				component: Pay,
				props: { merchant: user },
			},
			{
				component: Success,
				props: {
					variant: hasMultipleUsers ? 'sent' : 'success',
					merchant: user,
				},
			},
		]),
		...(hasMultipleUsers
			? [
					{
						component: Success,
						props: { variant: 'success' },
					},
				]
			: []),
	]

	// Clear orphan orders and invoices if there is not checkoutForm data
	if ($cart.orders || ($cart.invoices && !$checkoutFormStore)) {
		cart.clearKeys(['orders', 'invoices'])
	}
	// Avoid conflicts when users leaving the checkout, updating checkoutSteps, and coming back
	onDestroy(() => {
		currentStep.set(0)
	})
</script>

<div class="container py-6">
	<h2>Checkout</h2>
	<Stepper steps={checkoutSteps} />
</div>
