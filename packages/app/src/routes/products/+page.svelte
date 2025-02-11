<script lang="ts">
	import type { Selected } from 'bits-ui'
	import { browser } from '$app/environment'
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import SkeletonLoader from '$lib/components/common/skeletonLoader.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Pagination from '$lib/components/ui/pagination'
	import * as Select from '$lib/components/ui/select'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'
	import { reactiveDebounce, scrollToTop } from '$lib/utils'
	import { writable } from 'svelte/store'

	const pageSize = 12
	let page = 1
	let sort: Selected<'asc' | 'desc'> = {
		label: 'Latest',
		value: 'desc',
	}

	function onSortSelectedChange(v?: typeof sort) {
		sort = v!
	}
	let search = writable('')
	$: productColumns = getGridColumns($breakpoint, 'product')

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $search, (page = 1)
	$: productsQuery = createProductsByFilterQuery({
		pageSize: productColumns == 1 ? productColumns * 16 : productColumns * 4,
		page,
		order: sort.value ?? 'desc',
		search: $debouncedSearch,
	})
	$: if (page && browser) scrollToTop()
</script>

<div class="flex min-h-screen w-full flex-col">
	<CatMenu />
	<main class="text-black pt-8">
		<div class="gap-16 pb-12">
			<div class="px-4 lg:px-12">
				<div class="mb-6 m-4">
					<h2>Products</h2>
					<h3 class="font-light">Here you can find all the products of this community</h3>
				</div>
				<div class="flex gap-6 mb-6 m-4">
					<Input type="search" placeholder="Search..." bind:value={$search} />
					<Select.Root selected={sort} onSelectedChange={onSortSelectedChange}>
						<Select.Trigger class="w-[100px]">
							<Select.Value placeholder="Sort" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="desc">Latest</Select.Item>
							<Select.Item value="asc">Oldest</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				{#if $productsQuery.error}
					<p>{JSON.stringify($productsQuery.error)}</p>
				{/if}

				{#if $productsQuery.isLoading}
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						<SkeletonLoader count={2} class="h-4 w-[200px]" />
					</div>
				{/if}

				{#if $productsQuery.isError}
					<p>Error: {$productsQuery.error}</p>
				{/if}

				{#if $productsQuery.data?.products}
					<ItemGrid>
						{#each $productsQuery.data.products as item (item.id)}
							<ProductItem product={item} />
						{/each}
					</ItemGrid>

					<div class="mt-6">
						<Pagination.Root bind:page count={$productsQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
								{#if $breakpoint === 'sm'}
									<Pagination.Item>
										<Pagination.Link page={{ type: 'page', value: currentPage ?? 0 }} isActive={true}>
											{currentPage}
										</Pagination.Link>
									</Pagination.Item>
								{:else}
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<Pagination.Ellipsis />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link {page} isActive={currentPage == page.value}>
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
								{/if}
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						</Pagination.Root>
					</div>
				{:else if !$productsQuery.isLoading && $productsQuery.data?.products.length === 0}
					<p class="text-center">No results for your query :)</p>
				{/if}
			</div>
		</div>
	</main>
</div>
