<script lang="ts">
	import autoAnimate from '@formkit/auto-animate'
	import { createCategoriesByFilterQuery } from '$lib/fetch/category.queries'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { reactiveDebounce } from '$lib/utils'
	import { writable } from 'svelte/store'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'
	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import CatCompactItem from './cat-compact-item.svelte'

	let search = writable('')
	let showSearch = false
	let scrollContainer: HTMLDivElement

	$: pageSize = $breakpoint == 'lg' ? 16 : 10
	let page = 1

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $search, (page = 1)
	$: categoriesQuery = createCategoriesByFilterQuery({ pageSize, page, search: $debouncedSearch })

	$: hasNextPage = ($categoriesQuery.data?.total ?? 0) > page * pageSize
	$: hasPreviousPage = page > 1

	function toggleSearch() {
		showSearch = !showSearch
		if (!showSearch) {
			$search = ''
		}
	}

	function nextPage() {
		if (hasNextPage) {
			page += 1
			scrollContainer?.scrollTo({ left: 0, behavior: 'smooth' })
		}
	}

	function previousPage() {
		if (hasPreviousPage) {
			page -= 1
			scrollContainer?.scrollTo({ left: 0, behavior: 'smooth' })
		}
	}
</script>

<div class="flex flex-col gap-4 bg-black p-2 py-3">
	{#if $categoriesQuery.isLoading && page === 1}
		<div class="flex gap-4 overflow-x-auto">
			{#each [...Array(6)] as _, i}
				<Skeleton class="h-12 w-32 flex-shrink-0" />
			{/each}
		</div>
	{:else if $categoriesQuery.data?.categories?.length}
		<div class="relative">
			<div class="flex overflow-x-auto scrollbar-hide" bind:this={scrollContainer}>
				<div class="flex gap-4 items-center px-1" use:autoAnimate={{ duration: 150 }}>
					<Button
						variant="secondary"
						size="icon"
						on:click={toggleSearch}
						class="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
					>
						<span class="i-mdi-magnify text-xl" />
					</Button>

					{#if showSearch}
						<div class="flex-shrink-0 w-64">
							<Input type="search" placeholder="Search categories..." bind:value={$search} class="h-12 rounded-full" />
						</div>
					{/if}

					{#if hasPreviousPage}
						<Button
							variant="secondary"
							size="icon"
							on:click={previousPage}
							class="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
						>
							<span class="i-mdi-chevron-left text-xl" />
						</Button>
					{/if}

					{#each $categoriesQuery.data?.categories as cat (cat.name)}
						<div class="flex-shrink-0">
							<CatCompactItem {cat} />
						</div>
					{/each}

					{#if hasNextPage}
						<Button
							variant="secondary"
							size="icon"
							on:click={nextPage}
							class="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
						>
							<span class="i-mdi-chevron-right text-xl" />
						</Button>
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
