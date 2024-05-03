<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { Menubar as MenubarPrimitive } from 'bits-ui'

	type $$Props = MenubarPrimitive.Props

	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<MenubarPrimitive.Root class={cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', className)} {...$$restProps}>
	<slot />
</MenubarPrimitive.Root>
