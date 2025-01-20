<script lang="ts">
	import { responsiveButtonClasses } from '$lib/stores/breakpoint'
	import { cn } from '$lib/utils.js'
	import { Button as ButtonPrimitive } from 'bits-ui'

	import type { Events, Props } from './index.js'
	import { buttonVariants } from './index.js'

	type IconPosition = 'left' | 'right' | undefined
	type $$Props = Props & {
		iconPosition?: IconPosition
	}
	type $$Events = Events

	let className: $$Props['class'] = undefined
	export let variant: $$Props['variant'] = 'primary'
	export let size: $$Props['size'] = 'default'
	export let builders: $$Props['builders'] = []
	export let iconPosition: IconPosition = undefined
	export { className as class }

	const hasIcon = $$slots.icon

	$: classes = cn(
		buttonVariants({ variant, size, className }),
		hasIcon && 'inline-flex items-center gap-2',
		$responsiveButtonClasses?.[size || 'default'],
	)
</script>

<ButtonPrimitive.Root {builders} class={classes} type="button" {...$$restProps} on:click on:keydown>
	{#if hasIcon && iconPosition === 'right'}
		<slot />
		<slot name="icon" />
	{:else}
		{#if hasIcon}
			<slot name="icon" />
		{/if}
		<slot />
	{/if}
</ButtonPrimitive.Root>
