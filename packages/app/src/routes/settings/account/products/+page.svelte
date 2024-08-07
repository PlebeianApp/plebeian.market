<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { page } from '$app/stores'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { fetchUserProductData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
	import { mergeWithExisting, nav_back } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { userExist, activeUser } = data
	let toDisplayProducts: Partial<DisplayProduct>[] = []
	let productsMode: 'list' | 'create' | 'edit' = 'list'

	$: productsQuery = createProductsByFilterQuery({
		userId: activeUser?.id,
		pageSize: 100,
	})

	$: productsMixture = mergeWithExisting($productsQuery?.data?.products ?? [], toDisplayProducts, 'id')
	$: productsMode === 'list' ? $productsQuery?.refetch() : null

	let currentProduct: Partial<DisplayProduct> | null = null

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	$: if (productsMode === 'edit' && productsMixture && currentProduct) {
		const updatedProduct = productsMixture.find((product) => product.id === currentProduct?.id)
		if (updatedProduct) {
			currentProduct = updatedProduct
		}
	}

	onMount(async () => {
		if (!activeUser?.id) return
		const { products: productsData } = await fetchUserProductData(activeUser.id)

		if (productsData?.size) {
			const normalizedProducts = await normalizeProductsFromNostr(productsData, activeUser.id)
			toDisplayProducts = normalizedProducts?.toDisplayProducts ?? []
		}
	})
</script>

<div class="pb-4 space-y-2">
	{#if productsMode === 'list'}
		<div class="flex justify-between items-center">
			<div class=" flex items-center gap-1">
				<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				<section>
					<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
					<p class="text-gray-600">{linkDetails?.description}</p>
				</section>
			</div>

			<Button
				on:click={() => {
					productsMode = 'create'
					currentProduct = null
				}}
				variant="outline"
				class="border-2 border-black font-bold px-6">New</Button
			>
		</div>
	{:else if productsMode === 'create' || productsMode === 'edit'}
		<button class="w-fit" on:click={() => (productsMode = 'list')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</button>
	{/if}
	<div class="flex flex-col gap-2">
		{#if productsMode === 'list'}
			{#if $productsQuery?.isLoading}
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			{:else}
				{#each productsMixture as product}
					<Button
						on:click={() => {
							productsMode = 'edit'
							currentProduct = product
						}}
						class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
						variant="outline"
					>
						<div class="flex items-center gap-2">
							<span class="i-tdesign-store w-6 h-6" />
							<span>{product.name}</span>
						</div>
					</Button>
				{/each}
			{/if}
		{:else if productsMode === 'create' || productsMode === 'edit'}
			<CreateEditProduct product={currentProduct} on:success={() => (productsMode = 'list')} />
		{/if}
	</div>
</div>
