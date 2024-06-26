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

	import Spinner from './assets/spinner.svelte'
	import { Button } from './ui/button'

	let isOpen = false
	$: isOpen = $drawerUI.id !== null

	let currentProduct: CreateQueryResult<DisplayProduct, Error> | null = null
	let currentStall: CreateQueryResult<RichStall, Error> | null = null

	$: if ($drawerUI.id) {
		if ($drawerUI.id === 'new:product') {
			currentProduct = null
		} else if ($drawerUI.id === 'new:stall') {
			currentStall = null
		} else {
			if ($drawerUI.id.includes('30018')) {
				currentProduct = createProductQuery($drawerUI.id)
			} else if ($drawerUI.id.includes('30017')) {
				currentStall = createStallQuery($drawerUI.id)
			}
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
		<Sheet.Header>
			{#if $drawerUI.id}
				<Sheet.Title class="flex flex-row justify-between items-center content-center">
					<Button size="icon" variant="outline" class=" border-none" on:click={closeDrawer}>
						<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
					</Button>
					{#if $drawerUI.id === 'new:product'}
						Create new product
					{:else if $drawerUI.id === 'new:stall'}
						Create new stall
					{:else if $drawerUI.id.includes('30018')}<span>Edit product</span><Button
							on:click={handleDeleteProduct}
							size="icon"
							variant="ghost"
							class=" text-destructive border-0"><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
						>
					{:else}<span>Edit stall</span>
						<Button on:click={handleDeleteStall} size="icon" variant="ghost" class=" text-destructive border-0"
							><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
						>
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
				{:else if $drawerUI.id.includes('30018')}
					{#if $currentProduct !== null}
						{#if $currentProduct.isLoading}
							<Spinner />
						{:else if $currentProduct.error}
							<div>{$currentProduct.error.message}</div>
						{:else}
							<CreateEditProduct product={$currentProduct.data} on:success={handleSuccess} />
						{/if}
					{/if}
				{:else if $drawerUI.id.includes('30017')}
					{#if $currentStall !== null}
						{#if $currentStall.isLoading}
							<Spinner />
						{:else if $currentStall.error}
							<div>{$currentStall.error.message}</div>
						{:else}
							<CreateEditStall stall={$currentStall.data} on:success={handleSuccess} />
						{/if}
					{/if}
				{/if}
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
