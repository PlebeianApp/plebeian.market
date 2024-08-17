<script lang="ts">
	import type { SvelteComponent } from 'svelte'
	import type { Writable } from 'svelte/store'
	import { writable } from 'svelte/store'

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
	export let currentStep: Writable<number> = writable(0)
</script>

<div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
	<div class="bg-green-500 h-2.5 rounded-full" style="width: {($currentStep / (steps.length - 1)) * 100}%"></div>
</div>

<div class="mt-8">
	{#if steps[$currentStep]?.component}
		<svelte:component this={steps[$currentStep].component} {...steps[$currentStep].props} />
	{/if}
</div>
