<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createShippingQuery } from '$lib/fetch/shipping.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { fetchStallData, normalizeStallData } from '$lib/nostrSubs/utils'
	import { getShippingMethod, setShippingMethod } from '$lib/stores/cart'
	import { checkIfStallExists, checkIfUserExists, truncateString } from '$lib/utils'
	import { onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'

	export let stallId: string

	let stallExist: boolean | undefined = undefined
	let stallData: Partial<RichStall> | null = null
	let shippingData: Partial<RichShippingInfo>[] | undefined
	let isLoading = true

	$: stallQuery = stallExist !== undefined && stallExist ? createStallQuery(stallId) : undefined
	$: shippingMethods = stallExist !== undefined && stallExist ? createShippingQuery(stallId) : undefined
	$: currentShippingMethodId = getShippingMethod(stallId)
	$: {
		if ($stallQuery?.data) stallData = $stallQuery.data
		if ($shippingMethods?.data) shippingData = $shippingMethods.data
		isLoading = $stallQuery?.isLoading ?? false
	}

	function handleShippingMethodSelect(methodId: string) {
		setShippingMethod(stallId, methodId)
	}

	onMount(async () => {
		stallExist = await checkIfStallExists(stallId)
		if (!stallExist) {
			const { stallNostrRes } = await fetchStallData(stallId, NDKSubscriptionCacheUsage.ONLY_CACHE)
			if (stallNostrRes) {
				const normalizedStall = await normalizeStallData(stallNostrRes)
				if (normalizedStall.data) {
					stallData = normalizedStall.data
					normalizedStall.data.shipping?.length && (shippingData = normalizedStall.data.shipping)
				}
			}
			isLoading = false
		}
	})
</script>

<div class="flex flex-col justify-between gap-2">
	{#if isLoading}
		<Spinner />
	{:else if stallData}
		<div class="flex flex-row gap-1">
			<span class="i-tdesign-store w-6 h-6" />
			<span>{stallData.name}</span>
		</div>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="secondary" class="border-2 border-black h-8" builders={[builder]}>
					{#if shippingData?.length && $currentShippingMethodId}
						{@const method = shippingData?.find((m) => m.id === $currentShippingMethodId)}
						{method?.name || method?.id ? truncateString(method.name || method.id) : 'Select shipping method'}
					{:else}
						Select shipping method
					{/if}
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Shipping Method</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<section class="max-h-[350px] overflow-y-auto">
					{#if shippingData?.length}
						{#each shippingData as method}
							<DropdownMenu.CheckboxItem
								checked={$currentShippingMethodId === method.id}
								on:click={() => handleShippingMethodSelect(String(method?.id))}
							>
								<section class="flex items-center w-full justify-between">
									<span>{truncateString(String(method.name || method.id))}</span>
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
	{:else}
		<div>Stall not found</div>
	{/if}
</div>
