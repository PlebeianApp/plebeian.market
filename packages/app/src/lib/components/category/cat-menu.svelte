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

	let search = writable<string>('')
	let showSearch = false
	let scrollContainer: HTMLDivElement

	$: pageSize = $breakpoint == 'lg' ? 16 : 10
	let page = 1

	$: debouncedSearch = reactiveDebounce(search, 600)
	$: $debouncedSearch && page !== 1 && (page = 1)
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

{#if !$categoriesQuery.isLoading && $categoriesQuery.data?.categories?.length}
	<div class="flex flex-col gap-4 bg-black p-2 py-3">
		<div class="grid items-center" style="grid-template-columns: auto 1fr;">
			<div class="flex gap-4 items-center bg-black pr-4">
				<Button
					variant="secondary"
					size="icon"
					on:click={toggleSearch}
					class="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
				>
					{#if !showSearch}
						<span class="i-mdi-magnify text-xl" />
					{:else}
						<span class="i-mdi-close text-xl" />
					{/if}
				</Button>

				{#if showSearch}
					<div class="w-64 transition-all duration-200">
						<Input
							type="search"
							placeholder="Search categories..."
							bind:value={$search}
							class="rounded-full bg-black text-white border-secondary focus-visible:ring-offset-0 focus-visible:ring-secondary focus-visible:border-secondary"
							autoFocus={showSearch}
						/>
					</div>
				{/if}
			</div>

			<div class="overflow-x-auto scrollbar-hide" bind:this={scrollContainer}>
				<div class="flex gap-4 items-center" use:autoAnimate={{ duration: 150 }}>
					{#if $categoriesQuery.data?.categories?.length}
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

						{#each $categoriesQuery.data.categories as cat (cat.name)}
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
					{:else}
						<div class="text-white">
							{$search.trim() ? 'No results...' : 'No categories available'}
						</div>
					{/if}
				</div>
			</div>
		</div>
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
{/if}
