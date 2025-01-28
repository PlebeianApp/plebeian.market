<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { cart } from '$lib/stores/cart'
	import { truncateString } from '$lib/utils'
	import { ChevronDown } from 'lucide-svelte'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'

	export let stallCoordinate: string
	export let mode: 'edit' | 'view' = 'edit'
	$: stallQuery = createStallQuery(stallCoordinate)
	$: currentShippingMethodId = $cart.stalls[stallCoordinate]?.shippingMethodId || null

	function handleShippingMethodSelect(methodId: string) {
		const selectedMethod = $stallQuery.data?.stall?.shipping?.find((m) => m.id === methodId)
		if (selectedMethod) {
			cart.setShippingMethod(stallCoordinate, selectedMethod)
		}
	}

	function getMethodDisplayName(method: Partial<RichShippingInfo>) {
		return (
			method?.name ||
			(method?.countries?.length && method.countries.join(',')) ||
			(method?.regions?.length && method.regions.join(',')) ||
			(method?.id && truncateString(String(method.id))) ||
			'Select shipping method'
		)
	}
</script>

<div class="flex flex-col justify-between gap-2">
	{#if $stallQuery.isLoading}
		<Spinner />
	{:else if $stallQuery.data?.stall}
		<div class="flex flex-row gap-1">
			<span class="i-tdesign-store w-6 h-6" />
			<span>{$stallQuery.data?.stall.name}</span>
		</div>
		{#if mode === 'edit'}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="tertiary" iconPosition="right" class="border-2 border-black h-8 justify-between" builders={[builder]}>
						{#if $stallQuery.data?.stall?.shipping?.length && currentShippingMethodId}
							{@const method = $stallQuery.data?.stall?.shipping?.find((m) => m.id === currentShippingMethodId)}
							{#if method}
								<span class="truncate">{getMethodDisplayName(method)}</span>
								<span class="ml-2">{method.cost}</span>
							{/if}
						{:else}
							Select shipping
						{/if}
						<ChevronDown slot="icon" class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-full">
					<DropdownMenu.Label>Shipping Method</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<section class="max-h-[350px] overflow-y-auto">
						{#if $stallQuery.data?.stall?.shipping?.length}
							{#each $stallQuery.data?.stall?.shipping as method}
								<DropdownMenu.CheckboxItem
									checked={currentShippingMethodId === method.id}
									on:click={() => handleShippingMethodSelect(String(method?.id))}
								>
									<section class="flex items-center w-full justify-between">
										{#if method}
											<span>
												{getMethodDisplayName(method)}
												<span>{method.cost}</span>
											</span>
										{/if}
										<span>{method.cost}</span>
									</section>
								</DropdownMenu.CheckboxItem>
							{/each}
						{:else}
							<DropdownMenu.Item disabled>No shipping methods available</DropdownMenu.Item>
						{/if}
					</section>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	{:else}
		<div>Shop not found</div>
	{/if}
</div>
