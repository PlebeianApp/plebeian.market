<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import { Button } from '$lib/components/ui/button'
	import { cn } from '$lib/utils'
	import { ChevronDown } from 'lucide-svelte'

	import * as DropdownMenu from './index'

	type $$Props = HTMLAttributes<HTMLButtonElement> & {
		variant?: 'default' | 'custom'
	}

	export let variant: $$Props['variant'] = 'default'
	export let class_name: string | undefined = undefined
</script>

<DropdownMenu.Trigger asChild let:builder>
	{#if variant === 'default'}
		<Button
			builders={[builder]}
			variant="outline"
			{...$$restProps}
			class={cn('flex items-center w-full justify-between gap-1', class_name)}
		>
			<slot />
			<ChevronDown class="h-4 w-4" />
		</Button>
	{:else}
		<slot {builder} />
	{/if}
</DropdownMenu.Trigger>
