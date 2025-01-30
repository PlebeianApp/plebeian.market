<script lang="ts">
	import { page } from '$app/stores'
	import Hero from '$lib/components/common/hero.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import UserCardCompact from '$lib/components/users/user-card-compact.svelte'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'

	$: categoriesQuery = createCategoriesByFilterQuery({
		pageSize: getGridColumns($breakpoint, 'product') * 4,
		category: $page.params.category,
		userId: $page.params.userId,
	})
	$: categoryData = $categoriesQuery.data?.categories[0]

	$: productsQuery = createProductsByFilterQuery({
		userId: $page.params.userId,
		category: $page.params.category,
		pageSize: 15,
	})

	$: userQuery = createUserByIdQuery($page.params.userId)
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<Hero>
				<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
				<h1 class="relative z-10">{categoryData?.name}</h1>
				{#if $userQuery?.data}
					<UserCardCompact user={$userQuery.data} />
				{/if}
			</Hero>

			{#if $productsQuery.data}
				<ItemGrid title="Products">
					{#each $productsQuery.data.products as product}
						<ProductItem {product} />
					{/each}
				</ItemGrid>
			{/if}
		</main>
	</div>
</div>
