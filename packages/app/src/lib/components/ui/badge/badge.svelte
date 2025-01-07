<script lang="ts">
	import { cn } from '$lib/utils.js'

	import type { Size, Variant } from './index.js'
	import { badgeVariants } from './index.js'

	let className: string | undefined | null = undefined
	export let href: string | undefined = undefined
	export let variant: Variant = 'primary'
	export let size: Size = 'default'
	export { className as class }
</script>

<svelte:element this={href ? 'a' : 'span'} {href} class={cn(badgeVariants({ variant, size, className }))} {...$$restProps}>
	<slot />
</svelte:element>
