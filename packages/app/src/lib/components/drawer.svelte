<script lang="ts">
	import type { CreateQueryResult } from '@tanstack/svelte-query'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import * as Sheet from '$lib/components/ui/sheet/index.js'
	import { KindProducts, KindStalls } from '$lib/constants'
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
	$: isOpen = $drawerUI.id !== null
  
	let currentProduct: Partial<DisplayProduct> | null = null
	let currentStall: Partial<RichStall> | null = null

	let productQuery: ReturnType<typeof createProductQuery> | undefined
	let stallQuery: ReturnType<typeof createStallQuery> | undefined

	let userExist: boolean | undefined = undefined

	$: if ($drawerUI.id) {
		check()
		if ($drawerUI.id === 'new:product') {
			currentProduct = null
			productQuery = undefined
		} else if ($drawerUI.id === 'new:stall') {
			currentStall = null
			stallQuery = undefined
		} else {
			if ($drawerUI.id.includes(`${KindProducts}`)) {
				productQuery = userExist !== undefined && userExist ? createProductQuery($drawerUI.id) : undefined
			} else if ($drawerUI.id.includes(`${KindStalls}`)) {
				stallQuery = userExist !== undefined && userExist ? createStallQuery($drawerUI.id) : undefined
			}
		}
	}

	$: {
		if ($productQuery?.data) {
			currentProduct = $productQuery.data
		}
		if ($stallQuery?.data) {
			currentStall = $stallQuery.data
		}
	}

	const check = async () => {
		userExist = await checkIfUserExists($ndkStore.activeUser?.pubkey)
		if (userExist == undefined) return
		if (!userExist && $drawerUI?.id?.includes(`${KindProducts}`)) {
			const { nostrProduct: productsData } = await fetchProductData($drawerUI.id as string)
			if (!productsData?.size) return
			if (productsData) {
				const result = normalizeProductsFromNostr(productsData, $ndkStore.activeUser?.pubkey as string)
				if (result) {
					const { toDisplayProducts: _toDisplay } = result
					currentProduct = _toDisplay[0]
				}
			}
		}
		if (!userExist && $drawerUI.id?.includes(`${KindStalls}`)) {
			const { stallNostrRes: stallData } = await fetchStallData($drawerUI.id as string)
			if (!stallData) return
			if (stallData) {
				const result = normalizeStallData(stallData)
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
		await $deleteStallMutation.mutateAsync(currentStall?.id as string)
		closeDrawer()
	}

	const handleDeleteProduct = async () => {
		await $deleteProductMutation.mutateAsync(currentProduct?.id as string)
		closeDrawer()
	}
</script>

<Sheet.Root bind:open={isOpen} onOutsideClick={closeDrawer}>
	<Sheet.Content side="right" class="min-w-[30vw] flex flex-col border-l-black border-2">
		<Sheet.Title class="flex flex-row justify-between items-center content-center">
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
					{#if $drawerUI.id === 'new:product'}
						Create new product
					{:else if $drawerUI.id === 'new:stall'}
						Create new stall
					{:else if $drawerUI.id.includes(`${KindProducts}`)}<span>Edit product</span><Button
							on:click={handleDeleteProduct}
							size="icon"
							variant="ghost"
							class=" text-destructive border-0"><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
						>
					{:else}
						<span>Edit stall</span>
						<Button on:click={handleDeleteStall} size="icon" variant="ghost" class=" text-destructive border-0"
							><span class="i-tdesign-delete-1 w-4 h-4"></span>
						</Button>
					{/if}
				</Sheet.Title>
			{/if}
		</Sheet.Header>
		<div class="grow">
			{#if $drawerUI.id}
				{#if $drawerUI.id === 'new:product'}
					<CreateEditProduct product={null} on:success={handleSuccess} forStall={$drawerUI.forStall} />
				{:else if $drawerUI.id === 'new:stall'}
					<CreateEditStall stall={null} on:success={handleSuccess} />
				{:else if $drawerUI.id.includes(`${KindProducts}`)}
					{#if currentProduct !== null}
						{#if !currentProduct}
							<Spinner />
						{:else}
							<CreateEditProduct product={currentProduct} on:success={handleSuccess} />
						{/if}
					{/if}
				{:else if $drawerUI.id.includes(`${KindStalls}`)}
					{#if currentStall !== null}
						{#if !currentStall}
							<Spinner />
						{:else}
							<CreateEditStall stall={currentStall} on:success={handleSuccess} />
						{/if}
					{/if}
				{/if}
			{/if}
		</Sheet.Title>
		{#if $drawerUI.drawerType === 'cart'}
			<ShoppingCart />
		{:else if $drawerUI.drawerType === 'product'}
			{#if $currentProduct?.data}
				<CreateEditProduct product={$currentProduct.data} on:success={handleSuccess} forStall={$drawerUI.forStall} />
			{:else}
				<CreateEditProduct product={null} on:success={handleSuccess} forStall={$drawerUI.forStall} />
			{/if}
		{:else if $drawerUI.drawerType === 'stall'}
			{#if $currentStall?.data}
				<CreateEditStall stall={$currentStall.data} on:success={handleSuccess} />
			{:else}
				<CreateEditStall stall={null} on:success={handleSuccess} />
			{/if}
		{/if}
	</Sheet.Content>
</Sheet.Root>
