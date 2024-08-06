<script lang="ts">
	import type { SvelteComponent } from 'svelte'

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Constructor<T> = new (...args: any[]) => T

	type OmitContext<T> = Omit<T, 'context' | 'currentStepIndex'>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Props<T> = T extends SvelteComponent<infer P, any, any> ? OmitContext<P> : never
	type PropsOrUndefined<T> = Props<T> extends Record<string, never> ? undefined : Props<T>

	type Step<T extends SvelteComponent = SvelteComponent> = {
		component: Constructor<T>
		props: PropsOrUndefined<T>
	}

	export let steps: Step[] = []
	export let currentStep = 0
</script>

<div class="w-full flex items-center">
	{#each steps as _, index}
		<div class="flex items-center">
			<div class="relative">
				<div
					class={`w-8 h-8 flex items-center justify-center rounded-full ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'} ${index === currentStep ? 'ring-4 ring-green-200' : ''}`}
				>
					{index + 1}
				</div>
				{#if index < steps.length - 1}
					<div class="absolute top-1/2 w-full border-t-2 border-gray-200 left-8"></div>
				{/if}
			</div>
			<div class="ml-2"></div>
		</div>
	{/each}
</div>

<div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
	<div class="bg-green-500 h-2.5 rounded-full" style="width: {(currentStep / (steps.length - 1)) * 100}%"></div>
</div>

<div class="mt-8">
	{#if steps[currentStep]?.component}
		<svelte:component this={steps[currentStep].component} {...steps[currentStep].props} />
	{/if}
</div>
