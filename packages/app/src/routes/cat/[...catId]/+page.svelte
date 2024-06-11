<script lang="ts">
	import { page } from '$app/stores'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import UserCardCompact from '$lib/components/users/user-card-compact.svelte'
	import { createCategoriesByFilterQuery, createProductsByFilterQuery, createUserByIdQuery } from '$lib/fetch/queries'

	$: categoriesQuery = createCategoriesByFilterQuery({ catId: $page.params.catId })
	$: categoryData = $categoriesQuery.data?.[0]

	$: productsQuery = createProductsByFilterQuery({
		catId: $page.params.catId,
		pageSize: 15,
	})

	$: userQuery = categoryData?.userId ? createUserByIdQuery(categoryData.userId) : null
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="relative w-full bg-black py-20 text-center text-white">
				<Pattern />
				<h2 class="relative z-10 flex gap-2 items-center justify-center"><span class=" i-mdi-category-outline w-6 h-6" />Category</h2>
				<h1 class="relative z-10">{categoryData?.name}</h1>
				{#if $userQuery?.data}
					<UserCardCompact user={$userQuery.data} />
				{/if}
				<p>{categoryData?.description}</p>
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
