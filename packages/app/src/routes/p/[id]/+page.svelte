<script lang="ts">
	import CatCompactItem from '$lib/components/category/cat-compact-item.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ npub, pubkey, name, image } = data)

	let isMe = false

	$: categoriesQuery = createCategoriesByFilterQuery({ userId: $ndkStore.activeUser?.pubkey })

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
	})

	$: productsQuery = createProductsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
	})

	$: {
		const userId = $ndkStore.activeUser?.pubkey
		isMe = userId === pubkey
	}
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<Pattern />
				<div class="w-fit z-10 justify-center">
					<div class="flex justify-center">
						<Avatar class="h-20 w-20">
							<AvatarImage src={image} alt="@shadcn" />
							<AvatarFallback>{name}</AvatarFallback>
						</Avatar>
					</div>
					<h2>{name}</h2>
					<div class="flex items-center">
						<Button variant="secondary" class="w-1/2 lg:w-auto">
							<code class="truncate">{npub}</code>
						</Button>
						<Button on:click={() => copyToClipboard(npub)}>Copy</Button>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger><Button>Create...</Button></DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<DropdownMenu.Item on:click={openDrawerForNewStall}>Create stall</DropdownMenu.Item>
									<DropdownMenu.Item on:click={openDrawerForNewProduct}>Create product</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			</div>
			{#if $categoriesQuery.data}
				<div class="py-5 lg:px-12">
					<div class="container">
						<h2>Categories</h2>
						<div class=" grid grid-cols-4 gap-2">
							{#each $categoriesQuery.data.filter((cat) => (cat.productCount ?? 0) > 0) as cat}
								<CatCompactItem {cat} isGlobal={false} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
			{#if $stallsQuery.data}
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Stalls</h2>
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each $stallsQuery.data as item}
								<StallItem stall={item} />
							{/each}
						</div>
					</div>
				</div>
			{/if}

			{#if $productsQuery.data}
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each $productsQuery.data as item}
								<ProductItem product={item} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>
