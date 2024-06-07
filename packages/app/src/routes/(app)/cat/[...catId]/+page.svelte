<script lang="ts">
	import type { ProductsFilter } from '$lib/schema'
	import type { RichCat } from '$lib/server/categories.service'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createQuery } from '@tanstack/svelte-query'
	import { page } from '$app/stores'
	import { GETAllCategories, GETAllProducts, GETUserFromId } from '$lib/apiUtils'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import UserCardCompact from '$lib/components/users/user-card-compact.svelte'
	import { productsFilterSchema } from '$lib/schema'

	import type { User } from '@plebeian/database'

	import type { PageData } from './$types'

	export let data: PageData

	$: catQuery = createQuery<RichCat>({
		queryKey: ['categories', $page.params.catId],
		queryFn: async () => {
			const [res] = await GETAllCategories(data.filter).then((res) => res.json())
			return res
		},
	})

	$: productsQuery = createQuery<DisplayProduct[]>({
		queryKey: ['products', $page.params.catId],
		queryFn: async () => {
			const filter: ProductsFilter = productsFilterSchema.parse({ catId: $page.params.catId, pageSize: 15 })
			const res = await GETAllProducts(filter)
			return res.json()
		},
	})

	$: userQuery = createQuery<User>({
		queryKey: ['users', $catQuery.data?.userId],
		queryFn: async () => {
			if (!$catQuery.data?.userId) return null
			const res = await GETUserFromId($catQuery.data.userId).then((res) => res.json())
			return res
		},
		enabled: !!$catQuery.data?.userId,
	})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<Pattern />
				<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
				<h1 class="relative z-10">{$catQuery.data?.name}</h1>
				{#if $userQuery.data}
					<UserCardCompact user={$userQuery.data} />
				{/if}
				<p>{$catQuery.data?.description}</p>
			</div>
			{#if $productsQuery.data}
				<div class=" px-4 py-20 lg:px-12">
					<div class="container">
						<h2 class="relative z-10 flex gap-2 items-center justify-center"><span />Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each $productsQuery.data as product}
								<ProductItem {product} />
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>
</div>
