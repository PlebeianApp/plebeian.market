<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui'

	type $$Props = RangeCalendarPrimitive.GridHeadProps

	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<RangeCalendarPrimitive.GridHead class={cn(className)} {...$$restProps}>
	<slot />
</RangeCalendarPrimitive.GridHead>
