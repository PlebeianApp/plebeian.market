<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { Separator as SeparatorPrimitive } from 'bits-ui'

	type $$Props = SeparatorPrimitive.Props

	let className: $$Props['class'] = undefined
	export let orientation: $$Props['orientation'] = 'horizontal'
	export let decorative: $$Props['decorative'] = undefined
	export { className as class }
</script>

<SeparatorPrimitive.Root
	class={cn('shrink-0 bg-border mt-2', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', className)}
	{orientation}
	{decorative}
	{...$$restProps}
/>
