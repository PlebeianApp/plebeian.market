<script lang="ts">
	import type { Step } from '$lib/components/checkout/types'
	import { currentStep } from '$lib/stores/checkout'
	import { createEventDispatcher } from 'svelte'

	export let steps: Step[] = []

	let canProceed = true
	const dispatch = createEventDispatcher()

	function goToNextStep() {
		if ($currentStep < steps.length - 1 && canProceed) {
			$currentStep += 1
			canProceed = false
			dispatch('stepChange', { step: $currentStep })
		}
	}

	function handleStepValidation(event: CustomEvent) {
		canProceed = event.detail.valid
		if (canProceed) goToNextStep()
	}
</script>

<div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
	<div class="bg-green-500 h-2.5 rounded-full" style="width: {($currentStep / (steps.length - 1)) * 100}%" />
</div>

<div class="mt-8">
	{#if steps[$currentStep]?.component}
		<svelte:component this={steps[$currentStep].component} {...steps[$currentStep].props} on:validate={handleStepValidation} />
	{/if}
</div>
