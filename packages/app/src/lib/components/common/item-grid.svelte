<script lang="ts">
	import type { Selected } from 'bits-ui'
	import * as Select from '$lib/components/ui/select'
	import { createEventDispatcher } from 'svelte'

	export let title: string | undefined = undefined
	export let forItemType: string = 'product'
	export let withSort: boolean = false

	const dispatch = createEventDispatcher()

	export let sort: Selected<'asc' | 'desc'> = {
		label: 'Latest',
		value: 'desc',
	}

	function onSortSelectedChange(v?: typeof sort) {
		dispatch('sortSelectedChange', v)
	}
</script>

{#if forItemType === 'product'}
	<div class="m-8">
		{#if title}
			<div class="flex flex-col md:flex-row justify-between items-center">
				<h2>{title}</h2>
				{#if withSort}
					<div class="md:w-1/6 w-full">
						<Select.Root selected={sort} onSelectedChange={onSortSelectedChange}>
							<Select.Trigger>
								<Select.Value placeholder="Sort" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="desc">Latest</Select.Item>
								<Select.Item value="asc">Oldest</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				{/if}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-8 md:gap-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-4">
			<slot />
		</div>
	</div>
{:else if forItemType === 'stall'}
	<div class="my-16 mx-4">
		{#if title}
			<h2>{title}</h2>
		{/if}
		<div class="grid grid-cols-1 gap-8 md:gap-16 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			<slot />
		</div>
	</div>
{/if}
