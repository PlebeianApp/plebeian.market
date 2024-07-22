<script lang="ts">
	import type { CreateQueryResult } from '@tanstack/svelte-query'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
	import * as Sheet from '$lib/components/ui/sheet/index.js'
	import { deleteProductMutation } from '$lib/fetch/products.mutations'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { deleteStallMutation } from '$lib/fetch/stalls.mutations'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { fetchProductData, fetchStallData, normalizeProductsFromNostr, normalizeStallData } from '$lib/nostrSubs/utils'
	import { closeDrawer, drawerUI } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { checkIfUserExists } from '$lib/utils'

	import ShoppingCart from './cart/shopping-cart.svelte'
	import { Button } from './ui/button'

	let isOpen: boolean = false

	let productQuery: ReturnType<typeof createProductQuery> | undefined
	let stallQuery: ReturnType<typeof createStallQuery> | undefined

	let userExist: boolean | undefined = undefined

	$: isOpen = $drawerUI.drawerType !== null

	let currentProduct: Partial<DisplayProduct> | null = null
	let currentStall: Partial<RichStall> | null = null

	$: if ($drawerUI.drawerType === 'product') {
		check()
		if ($drawerUI.id) {
			productQuery = userExist !== undefined && userExist ? createProductQuery($drawerUI.id) : undefined
		}
	} else if ($drawerUI.drawerType === 'stall') {
		check()
		if ($drawerUI.id) {
			stallQuery = userExist !== undefined && userExist ? createStallQuery($drawerUI.id) : undefined
		}
	}

	$: $productQuery?.data && (currentProduct = $productQuery.data)
	$: $stallQuery?.data && (currentStall = $stallQuery.data)

	const check = async () => {
		userExist = await checkIfUserExists($ndkStore.activeUser?.pubkey)
		if (!userExist && $drawerUI.drawerType === 'product') {
			const { nostrProduct: productsData } = await fetchProductData($drawerUI.id as string)
			if (!productsData?.size) return
			if (productsData) {
				const result = await normalizeProductsFromNostr(productsData, $ndkStore.activeUser?.pubkey as string)
				if (result) {
					const { toDisplayProducts: _toDisplay } = result
					currentProduct = _toDisplay[0]
				}
			}
		}
		if (!userExist && $drawerUI.drawerType === 'stall') {
			const { stallNostrRes: stallData } = await fetchStallData($drawerUI.id as string)
			if (stallData) {
				const result = (await normalizeStallData(stallData)).data
				if (result) {
					currentStall = result
				}
			}
		}
	}

	const handleSuccess = () => {
		closeDrawer()
	}

	const handleDeleteStall = async () => {
		if (!currentStall?.id) return
		await $deleteStallMutation.mutateAsync(currentStall.id)
		closeDrawer()
	}

	const handleDeleteProduct = async () => {
		if (!currentProduct?.id) return
		await $deleteProductMutation.mutateAsync(currentProduct.id)
		closeDrawer()
	}
</script>

<Sheet.Root bind:open={isOpen} onOutsideClick={closeDrawer}>
	<Sheet.Content side="right" class="min-w-[30vw] flex flex-col border-l-black border-2 p-2">
		<ScrollArea class="h-auto">
			<Sheet.Title class="flex flex-row justify-start items-center content-center ">
				<Button size="icon" variant="outline" class=" border-none" on:click={closeDrawer}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				{#if $drawerUI.drawerType === 'cart'}
					Your cart
				{:else if $drawerUI.drawerType === 'product'}
					{#if $drawerUI.id}<span>Edit product</span><Button
							on:click={handleDeleteProduct}
							size="icon"
							variant="ghost"
							class=" text-destructive border-0"><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
						>
					{:else}
						<span>Create new product</span>
					{/if}
				{:else if $drawerUI.drawerType === 'stall'}
					{#if $drawerUI.id}<span>Edit stall</span><Button
							on:click={handleDeleteStall}
							size="icon"
							variant="ghost"
							class=" text-destructive border-0"
							><span class="i-tdesign-delete-1 w-4 h-4"></span>
						</Button>
					{:else}
						<span>Create new stall</span>
					{/if}
				{/if}
			</Sheet.Title>
			{#if $drawerUI.drawerType === 'cart'}
				<ShoppingCart />
			{:else if $drawerUI.drawerType === 'product'}
				<!-- FIXME currentProduct is null -->
				{#if currentProduct}
					<CreateEditProduct product={currentProduct} on:success={handleSuccess} forStall={$drawerUI.forStall} />
				{:else}
					<CreateEditProduct product={null} on:success={handleSuccess} />
				{/if}
			{:else if $drawerUI.drawerType === 'stall'}
				<!-- FIXME currentStall is null -->
				{#if currentStall}
					<CreateEditStall stall={currentStall} on:success={handleSuccess} />
				{:else}
					<CreateEditStall stall={null} on:success={handleSuccess} />
				{/if}
			{/if}
		</ScrollArea>
	</Sheet.Content>
</Sheet.Root>
