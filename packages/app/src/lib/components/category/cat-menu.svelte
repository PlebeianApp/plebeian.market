<script lang="ts">
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { reactiveDebounce } from '$lib/utils'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'

	import Input from '../ui/input/input.svelte'
	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	let search = writable('')
	let showSearch = false
	let scrollContainer: HTMLDivElement
	let isLoading = false

	const pageSize = 24
	let page = 1

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $search, (page = 1)
	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize, page, search: $debouncedSearch })

	function toggleSearch() {
		showSearch = !showSearch
		if (!showSearch) {
			$search = ''
		}
	}
	// TODO: this is not working yet
	function handleScroll() {
		if (!scrollContainer || isLoading) return

		const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
		const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100

		const currentItemsCount = $categoriesQuery.data?.categories.length ?? 0
		const totalItems = $categoriesQuery.data?.total ?? 0
		const hasMoreItems = currentItemsCount < totalItems

		if (isNearEnd && hasMoreItems) {
			isLoading = true
			page += 1
			Promise.resolve().then(() => {
				isLoading = false
			})
		}
	}

	onMount(() => {
		if (scrollContainer) {
			scrollContainer.addEventListener('scroll', handleScroll)
		}

		return () => {
			if (scrollContainer) {
				scrollContainer.removeEventListener('scroll', handleScroll)
			}
		}
	})
</script>

<div class="flex flex-col gap-4">
	{#if $categoriesQuery.isLoading && page === 1}
		<div class="flex gap-4 overflow-x-auto">
			<Skeleton class="h-24 w-32 flex-shrink-0" />
			<Skeleton class="h-24 w-32 flex-shrink-0" />
			<Skeleton class="h-24 w-32 flex-shrink-0" />
		</div>
	{:else if $categoriesQuery.data?.categories?.length}
		<div class="relative">
			<div class="flex overflow-x-auto scrollbar-hide" bind:this={scrollContainer}>
				<div class="flex gap-4 px-1">
					<!-- Search toggle button -->
					<button
						on:click={toggleSearch}
						class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
					>
						<span class="i-mdi-magnify text-xl" />
					</button>

					<!-- Search input (shown/hidden based on toggle) -->
					{#if showSearch}
						<div class="flex-shrink-0 w-64">
							<Input type="search" placeholder="Search categories..." bind:value={$search} class="h-12" />
						</div>
					{/if}

					<!-- Category items -->
					{#each $categoriesQuery.data?.categories as cat (cat.name)}
						<div class="flex-shrink-0">
							<CatCompactItem {cat} />
						</div>
					{/each}

					<!-- Loading indicator for infinite scroll -->
					{#if isLoading}
						<div class="flex-shrink-0">
							<Skeleton class="h-24 w-32" />
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
