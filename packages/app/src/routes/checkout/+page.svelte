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
					variant: hasMultipleUsers ? 'multiMerchant' : 'singleMerchant',
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

	onDestroy(() => {
		!$checkoutFormStore && currentStep.set(0)
		if ($cart.invoices && !$checkoutFormStore) {
			cart.clearKeys(['orders', 'invoices'])
		} else {
			cart.clearKeys(['invoices'])
		}
	})
</script>

<div class="container py-6 px-6">
	<h2>Checkout</h2>
	<Stepper steps={checkoutSteps} />
</div>
