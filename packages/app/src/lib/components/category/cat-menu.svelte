<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Pagination from '$lib/components/ui/pagination'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { reactiveDebounce } from '$lib/utils'
	import { writable } from 'svelte/store'

	import Input from '../ui/input/input.svelte'
	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	let search = writable('')
	let isOpen = false

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $search, (page = 1)
	const pageSize = 16
	let page = 1

	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize, page, search: $debouncedSearch })
</script>

<div class="flex flex-col gap-4 sm:gap-6">
	{#if $categoriesQuery.isLoading}
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-12 w-full" />
		<Skeleton class="h-12 w-full" />
	{:else if $categoriesQuery.data?.categories?.length}
		<div class="flex flex-col gap-4">
			<Collapsible.Root bind:open={isOpen}>
				<div class="flex items-center justify-between">
					<h2 class="text-2xl font-bold">Top categories</h2>
					<Collapsible.Trigger>
						<div class="flex items-center gap-2">
							<span>Search & Filter</span>
							<span class={isOpen ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'} />
						</div>
					</Collapsible.Trigger>
				</div>

				<Collapsible.Content>
					<div class="flex flex-row gap-4 pt-4">
						<Input type="search" placeholder="Search..." bind:value={$search} />
						{#if $categoriesQuery.data?.total > pageSize}
							<Pagination.Root bind:page count={$categoriesQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
								<Pagination.Content>
									<Pagination.Item>
										<Pagination.PrevButton class="bg-white" />
									</Pagination.Item>
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<Pagination.Ellipsis />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link {page} isActive={currentPage == page.value} class="bg-white">
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
									<Pagination.Item>
										<Pagination.NextButton class="bg-white" />
									</Pagination.Item>
								</Pagination.Content>
							</Pagination.Root>
						{/if}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		</div>

		<div class="flex flex-col gap-6">
			<div class="flex flex-col">
				<div class="grid auto-cols-max grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8">
					{#each $categoriesQuery.data?.categories as cat (cat.name)}
						<CatCompactItem {cat} />
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
