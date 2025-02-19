<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { Select as SelectPrimitive } from 'bits-ui'

	type $$Props = SelectPrimitive.ItemProps
	type $$Events = SelectPrimitive.ItemEvents

	let className: $$Props['class'] = undefined
	export let value: $$Props['value']
	export let label: $$Props['label'] = undefined
	export let disabled: $$Props['disabled'] = undefined
	export { className as class }
</script>

<SelectPrimitive.Item
	{value}
	{disabled}
	{label}
	class={cn(
		'relative flex w-full cursor-default select-none items-center py-1.5 px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-black data-[highlighted]:text-accent data-[disabled]:opacity-50',
		className,
	)}
	{...$$restProps}
	on:click
	on:keydown
	on:focusin
	on:focusout
	on:pointerleave
	on:pointermove
>
	<slot>
		{label || value}
	</slot>
</SelectPrimitive.Item>
