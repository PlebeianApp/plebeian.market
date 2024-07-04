<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createShippingQuery } from '$lib/fetch/shipping.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { getShippingMethod, setShippingMethod } from '$lib/stores/cart'
	import { truncateString } from '$lib/utils'

	import { Button } from '../ui/button'

	export let stallId: string

	$: stall = createStallQuery(stallId)
	$: shippingMethods = createShippingQuery(stallId)
	$: currentShippingMethodId = getShippingMethod(stallId)

	function handleShippingMethodSelect(methodId: string) {
		setShippingMethod(stallId, methodId)
	}
</script>

<div class="flex flex-col justify-between gap-2">
	<div class="flex flex-row gap-1">
		<span class="i-tdesign-store w-6 h-6" />
		<span>{$stall.data?.name}</span>
	</div>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="secondary" class="border-2 border-black h-8" builders={[builder]}>
				{#if $currentShippingMethodId && $shippingMethods.data}
					{@const method = $shippingMethods.data.find((m) => m.id === $currentShippingMethodId)}
					{truncateString(method ? method.name || method.id : 'Select shipping method')}
				{:else}
					Select shipping method
				{/if}
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label>Shipping Method</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<section class="max-h-[350px] overflow-y-auto">
				{#if $shippingMethods.data}
					{#each $shippingMethods.data as method}
						<DropdownMenu.CheckboxItem
							checked={$currentShippingMethodId === method.id}
							on:click={() => handleShippingMethodSelect(method.id)}
						>
							<section class=" flex items-center w-full justify-between">
								<span>{truncateString(method.name || method.id)}</span>
								<span>{method.cost}</span>
							</section>
						</DropdownMenu.CheckboxItem>
					{/each}
				{:else}
					<DropdownMenu.Item disabled>Loading...</DropdownMenu.Item>
				{/if}
			</section>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
