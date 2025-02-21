<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { focusTrap } from '$lib/actions/focus-trap.js'
	import { cn } from '$lib/utils.js'

	import type { InputEvents } from './index.js'

	type $$Props = HTMLInputAttributes & {
		autoFocus?: boolean
	}
	type $$Events = InputEvents

	let className: $$Props['class'] = undefined
	export let value: $$Props['value'] = undefined
	export let autoFocus = false
	export { className as class }

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	export let readonly: $$Props['readonly'] = undefined

	let inputElement: HTMLInputElement
</script>

<div use:focusTrap={autoFocus} class="w-full">
	<input
		bind:this={inputElement}
		class={cn(
			'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-secondary focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
			className,
		)}
		bind:value
		{readonly}
		on:blur
		on:change
		on:click
		on:focus
		on:focusin
		on:focusout
		on:keydown
		on:keypress
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:paste
		on:input
		on:wheel
		{...$$restProps}
	/>
</div>
