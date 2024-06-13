<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { page } from '$app/stores'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	let productsMode: 'list' | 'create' | 'edit' = 'list'
	$: productsQuery = $ndkStore.activeUser?.pubkey
		? createProductsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
			})
		: null

	$: productsMode === 'list' ? $productsQuery?.refetch() : null

	let currentProduct: DisplayProduct | null = null
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
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
			{/if}
			{#each [...($productsQuery?.data ?? [])] as product}
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
		{:else if productsMode === 'create' || productsMode === 'edit'}
			<CreateEditProduct product={currentProduct} on:success={() => (productsMode = 'list')} />
		{/if}
	</div>
</div>
