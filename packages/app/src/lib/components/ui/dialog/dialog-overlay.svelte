<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { Dialog as DialogPrimitive } from 'bits-ui'
	import { fade } from 'svelte/transition'

	type $$Props = DialogPrimitive.OverlayProps

	let className: $$Props['class'] = undefined
	export let transition: $$Props['transition'] = fade
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 150,
	}
	export { className as class }
</script>

<DialogPrimitive.Overlay
	{transition}
	{transitionConfig}
	class={cn('fixed inset-0 z-50 bg-black bg-opacity-45 backdrop-blur-sm', className)}
	{...$$restProps}
/>
