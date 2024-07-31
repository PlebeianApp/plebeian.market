<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import * as Pagination from '$lib/components/ui/pagination'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'

	const pageSize = 10
	let page = 1
	$: stallQuery = createStallsByFilterQuery({ pageSize, page })
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container flex flex-col gap-6">
					<CatMenu />
					<h2>Stalls</h2>

					{#if $stallQuery.error}
						<p>{JSON.stringify($stallQuery.error)}</p>
					{/if}

					{#if $stallQuery.isLoading}
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
							{#each [...Array(6)] as _, i}
								<Skeleton class="h-4 w-[200px]" />
							{/each}
						</div>
					{/if}

					{#if $stallQuery.isError}
						<p>Error: {$stallQuery.error}</p>
					{/if}

					{#if $stallQuery.data}
						<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
							{#each $stallQuery.data.stalls as item}
								<StallItem stallData={item} />
							{/each}
						</div>
						<Pagination.Root bind:page count={$stallQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
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
			</div>
		</main>
	</div>
</div>
