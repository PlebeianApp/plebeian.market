<script lang="ts">
	import { pushState, replaceState } from '$app/navigation'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
	import * as Sheet from '$lib/components/ui/sheet/index.js'
	import { createProductQuery } from '$lib/fetch/products.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { closeDrawer, drawerUI } from '$lib/stores/drawer-ui'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Spinner from './assets/spinner.svelte'
	import ShoppingCart from './cart/shopping-cart.svelte'
	import PaymentDetailCreateEdit from './settings/paymentDetailCreateEdit.svelte'
	import { Button } from './ui/button'

	$: stallQuery = $drawerUI.drawerType === 'stall' && $drawerUI.id ? createStallQuery($drawerUI.id!) : undefined
	$: productQuery = $drawerUI.drawerType === 'product' && $drawerUI.id ? createProductQuery($drawerUI.id!) : undefined

	$: isOpen = $drawerUI.drawerType !== null
	$: isLoading = ($stallQuery?.isLoading || $productQuery?.isLoading) ?? false

	function handleSuccess() {
		closeDrawer()
	}

	let historyState: string | null = null

	onMount(() => {
		const handlePopState = (event: PopStateEvent) => {
			if (isOpen) {
				event.preventDefault()
				closeDrawer()
			}
		}

		window.addEventListener('popstate', handlePopState)

		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	})

	$: if (isOpen !== !!historyState) {
		historyState = isOpen ? 'drawer' : null
		const method = isOpen ? pushState : replaceState
		method('', { historyState })
	}
</script>

<Sheet.Root bind:open={isOpen} onOutsideClick={closeDrawer}>
	<Sheet.Content side="right" class="w-[100vw] sm:min-w-[85vw] md:min-w-[55vw] xl:min-w-[35vw] flex flex-col border-l-black border-2 p-2">
		{#if isLoading}
			<Spinner />
		{:else}
			<ScrollArea class="h-auto">
				<Sheet.Title class="flex flex-row-reverse justify-end items-center content-center ">
					<Button size="icon" variant="ghost" on:click={closeDrawer}>
						<span class="cursor-pointer i-tdesign-close w-6 h-6" />
					</Button>
					<div class="w-full">
						{#if $drawerUI.drawerType === 'cart'}
							Your cart
						{:else if $drawerUI.drawerType === 'stall'}
							{#if $drawerUI.id}
								<span>Edit {$drawerUI.drawerType}</span>
							{:else}
								<span>Create new {$drawerUI.drawerType}</span>
							{/if}
						{:else if $drawerUI.drawerType === 'product'}
							{#if $drawerUI.id}
								<span>Edit {$drawerUI.drawerType}</span>
							{:else}
								<span>Sell A Product</span>
							{/if}
						{:else if $drawerUI.drawerType === 'payment'}
							<span>Set a payment method</span>
						{/if}
					</div>
				</Sheet.Title>
				{#if $drawerUI.drawerType === 'cart'}
					<ShoppingCart />
				{:else if $drawerUI.drawerType === 'product'}
					{#key $productQuery?.data}
						<CreateEditProduct product={$productQuery?.data} on:success={handleSuccess} forStall={$drawerUI.forStall} />
					{/key}
				{:else if $drawerUI.drawerType === 'stall'}
					{#key $stallQuery?.data?.stall?.id}
						<CreateEditStall
							stall={$drawerUI.id ? $stallQuery?.data?.stall : null}
							on:success={handleSuccess}
							on:error={(e) => toast.error(`${e}`)}
						/>
					{/key}
				{:else if $drawerUI.drawerType == 'payment'}
					<PaymentDetailCreateEdit paymentDetail={null} isOpen={true} on:success={handleSuccess} />
				{/if}
			</ScrollArea>
		{/if}
	</Sheet.Content>
</Sheet.Root>
