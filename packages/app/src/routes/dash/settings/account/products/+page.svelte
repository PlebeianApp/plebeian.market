<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import SkeletonLoader from '$lib/components/common/skeletonLoader.svelte'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Select from '$lib/components/ui/select'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { fetchUserProductData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
	import ndkStore from '$lib/stores/ndk'
	import { mergeWithExisting } from '$lib/utils'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'

	let toDisplayProducts: Partial<DisplayProduct>[] = []
	let productsMode: 'list' | 'create' | 'edit' = 'list'

	const selectedShopId = writable<string | null>(null)
	const selectedShopName = writable<string>('All Products')

	$: productsQuery = createProductsByFilterQuery({
		userId: $ndkStore?.activeUser?.pubkey,
		pageSize: 100,
	})
	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
		pageSize: 999,
	})
	$: productsMixture = mergeWithExisting($productsQuery?.data?.products ?? [], toDisplayProducts, 'stall_id')
		.filter((product) => $stallsQuery.data?.stalls.some((stall) => stall.identifier == product.stall_id))
		// Filter by selected shop
		.filter((product) => !$selectedShopId || product.stall_id === $selectedShopId)

	let currentProduct: Partial<DisplayProduct> | null = null

	$: if (productsMode === 'edit' && productsMixture && currentProduct) {
		const updatedProduct = productsMixture.find((product) => product.id === currentProduct?.id)
		if (updatedProduct) {
			currentProduct = updatedProduct
		}
	}
	onMount(async () => {
		if (!$ndkStore?.activeUser?.pubkey) return
		const { products: productsData } = await fetchUserProductData($ndkStore?.activeUser?.pubkey)

		if (productsData?.size) {
			const normalizedProducts = await normalizeProductsFromNostr(productsData, $ndkStore?.activeUser?.pubkey)
			toDisplayProducts = normalizedProducts?.toDisplayProducts ?? []
		}
	})
</script>

<div class="pb-4 space-y-2">
	{#if productsMode === 'list'}
		<div class="flex flex-col sm:flex-row gap-2">
			<!-- Shop Filter -->
			<Select.Root
				selected={{
					value: $selectedShopId,
					label: $selectedShopName,
				}}
				onSelectedChange={(sEvent) => {
					if (sEvent) {
						$selectedShopId = sEvent.value
						$selectedShopName = sEvent.label ?? 'All Products'
					}
				}}
			>
				<Select.Trigger>
					{#if $selectedShopId}
						<div class="flex items-center gap-2">
							<span class="i-tdesign-store w-6 h-6" />
							{$selectedShopName}
						</div>
					{:else}
						<div class="flex items-center gap-2">
							<span class="i-mingcute-earth-2-line w-6 h-6" />
							All Products
						</div>
					{/if}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value={null}>
						<div class="flex items-center gap-2">
							<span class="i-mingcute-earth-2-line w-6 h-6" />
							All Products
						</div>
					</Select.Item>
					{#each $stallsQuery.data?.stalls ?? [] as stall (stall.id)}
						<Select.Item value={stall.identifier}>
							<div class="flex items-center gap-2">
								<span class="i-tdesign-store w-6 h-6" />
								{stall.name}
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button
				on:click={() => {
					productsMode = 'create'
					currentProduct = null
				}}
				variant="primary"
				class="border-2 border-black font-bold px-6 w-full sm:w-auto">New</Button
			>
		</div>
	{:else if productsMode === 'create' || productsMode === 'edit'}
		<button class="w-fit" on:click={() => (productsMode = 'list')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</button>
	{/if}
	<div class="flex flex-col gap-4 pt-2">
		{#if productsMode === 'list'}
			{#if $productsQuery?.isLoading}
				<SkeletonLoader count={3} class="h-12 w-full" />
			{:else}
				{#each productsMixture as product}
					<Button
						on:click={() => {
							productsMode = 'edit'
							currentProduct = product
						}}
						class="cursor-pointer border-black border flex justify-start items-center py-6 px-4 font-bold"
						variant="outline"
						size="lg"
					>
						<div class=" inline-flex items-center justify-between gap-2 w-full">
							<div class="flex items-center gap-2 truncate">
								<span class="i-mdi-package-variant-closed w-6 h-6" />
								<span class="truncate">{product.name}</span>
							</div>
							<div>
								<Button variant="ghost" size="icon">
									<span class="i-mdi-pencil-outline w-6 h-6" />
								</Button>
							</div>
						</div>
					</Button>
				{/each}
			{/if}
		{:else if productsMode === 'create' || productsMode === 'edit'}
			<CreateEditProduct
				product={currentProduct}
				forStall={productsMode === 'create' && $selectedShopId ? `30009:${$ndkStore?.activeUser?.pubkey}:${$selectedShopId}` : null}
				on:success={() => (productsMode = 'list')}
			/>
		{/if}
	</div>
</div>
