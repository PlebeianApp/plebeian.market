<script lang="ts">
	import Stepper from '$lib/components/stepper.svelte'
	import Review from '$lib/components/checkout-review.svelte'

	let currentStep = 0

	$: exampleSteps = [
		{
			component: Review,
			props: {},
		},
	]
</script>

<div class="container py-6">
	<h2>Checkout</h2>
	<Stepper steps={exampleSteps} {currentStep} />
</div>
