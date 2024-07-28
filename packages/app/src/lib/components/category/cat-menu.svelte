<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'

	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	const pageSize = 10
	let page = 1

	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize, page })
</script>

<div class="flex flex-col gap-6">
{#if $categoriesQuery.isLoading}
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
	<Skeleton class=" h-96 w-full" />
{:else if $categoriesQuery.data?.categories.length}
	<h3>Categories</h3>
	<div class="flex flex-col gap-6">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="lg:px-12">
					<div class="container">
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
							{#each $categoriesQuery.data?.categories as cat}
								<CatCompactItem {cat} />
							{/each}
						</div>
					</div>
				</div>
			</main>
		</div>
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
						<Pagination.Item isVisible={currentPage == page.value}>
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
	</div>
{/if}
</div>
