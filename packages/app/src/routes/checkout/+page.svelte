<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import Order from '$lib/components/checkout/order.svelte'
	import Pay from '$lib/components/checkout/pay.svelte'
	import Review from '$lib/components/checkout/review.svelte'
	import Success from '$lib/components/checkout/success.svelte'
	import Stepper from '$lib/components/stepper.svelte'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import { resolveQuery } from '$lib/utils'
	import { derived, get } from 'svelte/store'

	// $: paymentDetailsForMerchants = Object.fromEntries(Object.keys($cart.users).map(u => [u, createPaymentsForUserQuery(u)])) as Record<string, ReturnType<typeof createPaymentsForUserQuery>>
	const paymentDetailsForMerchants = derived(
		cart, // dependency store
		($cart, set) => {
			// Create an array of promises for all users
			const paymentDetailsPromises = Object.keys($cart.users).map(async (u) => {
				const queryResult = await resolveQuery(() => createPaymentsForUserQuery(u))
				return [u, queryResult]
			})

			Promise.all(paymentDetailsPromises).then((paymentDetailsEntries) => set(Object.fromEntries(paymentDetailsEntries)))
		},
		{} as Record<string, RichPaymentDetail[]>,
	)

	$: console.log('payment', $paymentDetailsForMerchants)
	$: exampleSteps = [
		{
			component: Review,
			props: {},
		},
		...Object.values($cart.users)
			.flatMap((user) => [
				{
					component: Order,
					props: {
						merchant: user,
					},
				},
				$paymentDetailsForMerchants[user.pubkey]?.length
					? {
							component: Pay,
							props: {
								merchant: user,
							},
						}
					: null,
				{
					component: Success,
					props: {
						variant: $paymentDetailsForMerchants[user.pubkey]?.length ? 'success' : 'sent',
					},
				},
			])
			.filter(Boolean),
		{
			component: Success,
			props: {
				variant: 'success',
			},
		},
	]
</script>

<div class="container py-6">
	<h2>Checkout</h2>
	<Stepper steps={exampleSteps} {currentStep} />
</div>
