<script lang="ts">
	import type { Step } from '$lib/components/checkout/types'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'

	export let steps: Step[] = []

	let canProceed = true

	function goToNextStep() {
		if ($currentStep < steps.length - 1 && canProceed) {
			$currentStep += 1
			canProceed = false
		}
	}

	function handleStepValidation(event: CustomEvent) {
		if (event.type === 'validate') {
			canProceed = event.detail.valid ?? false
			if (canProceed) goToNextStep()
		} else if (event.type === 'checkoutComplete') {
			setTimeout(() => {
				cart.clear()
			}, 500)
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
		/>
	{/if}
</div>
