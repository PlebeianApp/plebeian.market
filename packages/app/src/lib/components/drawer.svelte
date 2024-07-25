<script lang="ts">
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
	import { toast } from 'svelte-sonner'

	import ShoppingCart from './cart/shopping-cart.svelte'
	import { Button } from './ui/button'

	let productQuery: ReturnType<typeof createProductQuery> | undefined
	let stallQuery: ReturnType<typeof createStallQuery> | undefined
	let currentProduct: Partial<DisplayProduct> | null = null
	let currentStall: Partial<RichStall> | null = null
	let userExist: boolean | undefined = undefined

	$: isOpen = $drawerUI.drawerType !== null

	$: if ($drawerUI.drawerType && $drawerUI.id) {
		initializeData()
	}

	$: if ($productQuery?.data) currentProduct = $productQuery.data
	$: if ($stallQuery?.data) currentStall = $stallQuery.data

	async function initializeData() {
		userExist = await checkIfUserExists($ndkStore.activeUser?.pubkey)
		if (userExist) {
			if ($drawerUI.drawerType === 'product') {
				productQuery = createProductQuery($drawerUI.id!)
			} else if ($drawerUI.drawerType === 'stall') {
				stallQuery = createStallQuery($drawerUI.id!)
			}
		} else {
			await fetchDataFromNostr()
		}
	}

	async function fetchDataFromNostr() {
		if ($drawerUI.drawerType === 'product') {
			const { nostrProduct: productsData } = await fetchProductData($drawerUI.id as string)
			if (productsData?.size) {
				const result = await normalizeProductsFromNostr(productsData, $ndkStore.activeUser?.pubkey as string)
				if (result) {
					currentProduct = result.toDisplayProducts[0]
				}
			}
		} else if ($drawerUI.drawerType === 'stall') {
			const { stallNostrRes: stallData } = await fetchStallData($drawerUI.id as string)
			if (stallData) {
				const result = (await normalizeStallData(stallData)).data
				if (result) {
					currentStall = result
				}
			}
		}
	}

	function handleSuccess() {
		closeDrawer()
	}

	async function handleDelete() {
		if ($drawerUI.drawerType === 'stall' && currentStall?.id) {
			await $deleteStallMutation.mutateAsync(currentStall.id)
		} else if ($drawerUI.drawerType === 'product' && currentProduct?.id) {
			await $deleteProductMutation.mutateAsync(currentProduct.id)
		}
		closeDrawer()
	}
</script>

<Sheet.Root bind:open={isOpen} onOutsideClick={closeDrawer}>
	<Sheet.Content side="right" class="min-w-[30vw] flex flex-col border-l-black border-2 p-2">
		<ScrollArea class="h-auto">
			<Sheet.Title class="flex flex-row justify-start items-center content-center ">
				<Button size="icon" variant="outline" class="border-none" on:click={closeDrawer}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				{#if $drawerUI.drawerType === 'cart'}
					Your cart
				{:else if $drawerUI.drawerType === 'product' || $drawerUI.drawerType === 'stall'}
					{#if $drawerUI.id}
						<span>Edit {$drawerUI.drawerType}</span>
						<Button on:click={handleDelete} size="icon" variant="ghost" class="text-destructive border-0">
							<span class="i-tdesign-delete-1 w-4 h-4" />
						</Button>
					{:else}
						<span>Create new {$drawerUI.drawerType}</span>
					{/if}
				{/if}
			</Sheet.Title>
			{#if $drawerUI.drawerType === 'cart'}
				<ShoppingCart />
			{:else if $drawerUI.drawerType === 'product'}
				{#key currentProduct}
					<CreateEditProduct product={currentProduct} on:success={handleSuccess} forStall={$drawerUI.forStall} />
				{/key}
			{:else if $drawerUI.drawerType === 'stall'}
				{#key currentStall}
					<CreateEditStall stall={currentStall} on:success={handleSuccess} on:error={(e) => toast.error(`${e}`)} />
				{/key}
			{/if}
		</ScrollArea>
	</Sheet.Content>
</Sheet.Root>
