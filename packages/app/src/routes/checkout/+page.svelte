<script lang="ts">
	import Review from '$lib/components/checkout/review.svelte'
	import Success from '$lib/components/checkout/success.svelte'
	import Stepper from '$lib/components/stepper.svelte'
	import { currentStep } from '$lib/stores/checkout'

	$: exampleSteps = [
		{
			component: Review,
			props: {},
		},
		{
			component: Success,
			props: {},
		},
	]
</script>

<div class="container py-6">
	<h2>Checkout</h2>
	<Stepper steps={exampleSteps} currentStep={$currentStep} />
</div>
