<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { cart } from '$lib/stores/cart'
	import { truncateString } from '$lib/utils'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'

	export let stallId: string
	export let mode: 'edit' | 'view' = 'edit'
	$: stallQuery = createStallQuery(stallId)
	$: currentShippingMethodId = $cart.stalls[stallId]?.shippingMethodId || null

	function handleShippingMethodSelect(methodId: string) {
		const selectedMethod = $stallQuery.data?.stall?.shipping?.find((m) => m.id === methodId)
		if (selectedMethod) {
			cart.setShippingMethod(stallId, selectedMethod)
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
					<Button variant="secondary" class="border-2 border-black h-8" builders={[builder]}>
						{#if $stallQuery.data?.stall?.shipping?.length && currentShippingMethodId}
							{@const method = $stallQuery.data?.stall?.shipping?.find((m) => m.id === currentShippingMethodId)}
							{#if method}
								{getMethodDisplayName(method)}
								<span>{method.cost}</span>
							{/if}
						{:else}
							Select shipping method
						{/if}
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
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
		<div>Stall not found</div>
	{/if}
</div>
