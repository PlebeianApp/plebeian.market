<script lang="ts">
	import type { Step } from '$lib/components/checkout/types'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'

	export let steps: Step[] = []

	let canProceed = true

	function goToNextStep(times: number = 1) {
		if ($currentStep < steps.length - 1 && canProceed) {
			$currentStep += times
			canProceed = false
		}
	}

	function skipToSuccess() {
		goToNextStep(2)
	}

	function handleStepValidation(event: CustomEvent) {
		switch (event.type) {
			case 'validate':
				canProceed = event.detail.valid ?? false
				if (canProceed) goToNextStep()
				break
			case 'placeOrderOnly':
				canProceed = event.detail.valid ?? false
				skipToSuccess()
				break
			case 'checkoutComplete':
				setTimeout(() => {
					cart.clear()
				}, 500)
				break
		}
	}
</script>

<div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
	<div class="bg-green-500 h-2.5 rounded-full" style="width: {($currentStep / (steps.length - 1)) * 100}%" />
</div>

<div class="mt-8">
	{#if steps[$currentStep]?.component}
		<svelte:component
			this={steps[$currentStep].component}
			{...steps[$currentStep].props}
			on:validate={handleStepValidation}
			on:checkoutComplete={handleStepValidation}
			on:placeOrderOnly={handleStepValidation}
		/>
	{/if}
</div>
