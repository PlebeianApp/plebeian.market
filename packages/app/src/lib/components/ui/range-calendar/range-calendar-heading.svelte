<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui'

	type $$Props = RangeCalendarPrimitive.HeadingProps

	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<RangeCalendarPrimitive.Heading let:headingValue class={cn('text-sm font-medium', className)} {...$$restProps}>
	<slot {headingValue}>
		{headingValue}
	</slot>
</RangeCalendarPrimitive.Heading>
