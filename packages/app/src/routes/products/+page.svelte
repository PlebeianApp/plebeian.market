<script lang="ts">
	import type { Selected } from 'bits-ui'
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Pagination from '$lib/components/ui/pagination'
	import * as Select from '$lib/components/ui/select'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { reactiveDebounce } from '$lib/utils'
	import { writable } from 'svelte/store'

	const pageSize = 10
	let page = 1
	let sort: Selected<'asc' | 'desc'> = {
		label: 'Latest',
		value: 'desc',
	}
	function onSortSelectedChange(v?: typeof sort) {
		sort = v!
	}
	let search = writable('')

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: productsQuery = createProductsByFilterQuery({ pageSize, page, order: sort.value ?? 'desc', search: $debouncedSearch })
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-10 lg:px-12">
				<div class="container flex flex-col gap-6">
					<CatMenu />
					<h2>Products</h2>

					<div class="flex gap-6">
						<Input class="" type="search" placeholder="Search..." bind:value={$search} />
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
							{#each [...Array(2)] as _, i}
								<Skeleton class="h-4 w-[200px]" />
							{/each}
						</div>
					{/if}

					{#if $productsQuery.isError}
						<p>Error: {$productsQuery.error}</p>
					{/if}

					{#if $productsQuery.data?.products}
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
							{#each $productsQuery.data.products as item (item.id)}
								<ProductItem product={item} />
							{/each}
						</div>
						<Pagination.Root bind:page count={$productsQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
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
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						</Pagination.Root>
					{:else}
						No results for your query :)
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>
