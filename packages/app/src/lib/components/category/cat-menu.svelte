<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { reactiveDebounce } from '$lib/utils'
	import { writable } from 'svelte/store'

	import Input from '../ui/input/input.svelte'
	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	let search = writable('')

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $search, (page = 1)
	const pageSize = 10
	let page = 1

	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize, page, search: $debouncedSearch })
</script>

<div class="flex flex-col gap-4 sm:gap-6">
	{#if $categoriesQuery.isLoading}
		<Skeleton class=" h-12 w-full" />
		<Skeleton class=" h-12 w-full" />
		<Skeleton class=" h-12 w-full" />
	{:else if $categoriesQuery.data?.categories.length}
		<h3>Categories</h3>
		<Input class="" type="search" placeholder="Search..." bind:value={$search} />
		<div class="flex flex-col gap-6">
			<div class="flex flex-col">
				<main class="text-black">
					<div class="lg:px-12">
						<div class="grid auto-cols-max grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-24xl:grid-cols-5">
							{#each $categoriesQuery.data?.categories as cat (cat.name)}
								<CatCompactItem {cat} />
							{/each}
						</div>
					</div>
				</main>
			</div>
			{#if $categoriesQuery.data?.total > pageSize}
				<Pagination.Root bind:page count={$categoriesQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
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
			{/if}
		</div>
	{/if}
</div>
