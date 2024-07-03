<script lang="ts">
	import type { CreateQueryResult } from '@tanstack/svelte-query'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import * as Sheet from '$lib/components/ui/sheet/index.js'
	import { deleteProductMutation } from '$lib/fetch/products.mutations'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { deleteStallMutation } from '$lib/fetch/stalls.mutations'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { closeDrawer, drawerUI } from '$lib/stores/drawer-ui'

	import ShoppingCart from './cart/shopping-cart.svelte'
	import { Button } from './ui/button'

	let isOpen = false
	$: isOpen = $drawerUI.drawerType !== null

	let currentProduct: CreateQueryResult<DisplayProduct, Error> | null = null
	let currentStall: CreateQueryResult<RichStall, Error> | null = null

	$: if ($drawerUI.drawerType === 'product') {
		if ($drawerUI.id) {
			currentProduct = createProductQuery($drawerUI.id)
		} else {
			currentProduct = null
		}
	} else if ($drawerUI.drawerType === 'stall') {
		if ($drawerUI.id) {
			currentStall = createStallQuery($drawerUI.id)
		} else {
			currentStall = null
		}
	}

	const handleSuccess = () => {
		closeDrawer()
	}

	const handleDeleteStall = async () => {
		await $deleteStallMutation.mutateAsync($currentStall.data.id)
		closeDrawer()
	}

	const handleDeleteProduct = async () => {
		await $deleteProductMutation.mutateAsync($currentProduct.data.id)
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
				{:else}
					<span>Create new stall</span>
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
