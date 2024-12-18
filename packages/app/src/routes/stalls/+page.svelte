<script lang="ts">
	import type { Selected } from 'bits-ui'
	import { browser } from '$app/environment'
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Pagination from '$lib/components/ui/pagination'
	import * as Select from '$lib/components/ui/select'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { reactiveDebounce, scrollToTop } from '$lib/utils'
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
	$: $search, (page = 1)
	$: stallsQuery = createStallsByFilterQuery({ pageSize, page, order: sort.value ?? 'desc', search: $debouncedSearch })
	$: if (page && browser) scrollToTop()
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 lg:px-12 flex flex-col gap-6">
				<div>
					<h1>Market</h1>
					<h3 class=" font-light">Here you can find all the stalls of this community</h3>
				</div>
				<div class="container">
					<div class="gap-2 flex flex-col">
						<CatMenu />
						<div class=" flex flex-col gap-2">
							{#if $stallsQuery.isLoading}
								<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
									{#each [...Array(6)] as _, i}
										<Skeleton class="h-4 w-[200px]" />
									{/each}
								</div>
							{/if}
							{#if $stallsQuery.data?.stalls}
								<h2>Stalls</h2>
								<div class="flex flex-col gap-2">
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

								<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
									{#key $stallsQuery.data.stalls}
										{#each $stallsQuery.data.stalls as item (item.id)}
											<StallItem stallData={item} />
										{/each}
									{/key}
								</div>
								<div class="py-4">
									<Pagination.Root bind:page count={$stallsQuery.data?.total} perPage={pageSize} let:pages let:currentPage>
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
								</div>
							{:else}
								<div class=" px-4 py-20 lg:px-12">
									<div class=" flex flex-col items-center">
										<h2>Nothing yet...</h2>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
