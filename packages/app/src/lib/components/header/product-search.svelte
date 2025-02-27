<script lang="ts">
	import autoAnimate from '@formkit/auto-animate'
	import { KindProducts } from '$lib/constants'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { clickOutside, parseCoordinatesString, reactiveDebounce, stringToHexColor } from '$lib/utils'
	import { writable } from 'svelte/store'

	import Input from '../ui/input/input.svelte'

	let search = writable<string>('')
	let showResults = false
	let searchContainer: HTMLDivElement

	$: debouncedSearch = reactiveDebounce(search, 600)

	$: searchQuery = createProductsByFilterQuery({
		search: $debouncedSearch || '',
		page: 1,
		pageSize: 5,
		order: 'asc',
		// If there is no search, we want to show one product per user
		onePerUser: $debouncedSearch ? undefined : true,
	})

	$: filteredProducts = $searchQuery.data?.products?.filter(
		(product) => !$search || product.name.toLowerCase().includes($search.toLowerCase()),
	)

	function clearSearch() {
		$search = ''
		showResults = false
	}

	function handleClickOutside() {
		showResults = false
	}

	function handleFocus() {
		showResults = true
	}
</script>

<div class="relative w-full" use:clickOutside={handleClickOutside}>
	<Input
		type="search"
		placeholder="Search Products"
		bind:value={$search}
		on:focus={handleFocus}
		class="px-4 w-full bg-secondary-background text-white border-none focus-visible:ring-offset-0 focus-visible:ring-secondary focus-visible:border-none rounded-full [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
	/>
	{#if $search}
		<button
			on:click={clearSearch}
			class="absolute right-4 top-[60%] -translate-y-1/2 text-xl text-secondary hover:text-white transition-colors"
		>
			<span class="i-tdesign-close" />
		</button>
	{:else}
		<span class="i-mdi-magnify absolute right-4 top-1/2 -translate-y-1/2 text-xl text-secondary" />
	{/if}

	{#if showResults && $searchQuery && !$searchQuery.isError}
		<div
			class="p-2 flex flex-col gap-2 absolute top-full mt-2 bg-[#1c1c1c] rounded-lg shadow-lg w-full lg:w-[480px] lg:left-auto lg:right-0"
			bind:this={searchContainer}
			use:autoAnimate={{ duration: 150 }}
		>
			{#if $searchQuery.isLoading}
				<div class="p-4 text-center text-gray-400">
					{#if $search}
						Searching for "{$search}"...
					{/if}
				</div>
			{:else if filteredProducts?.length}
				{#if !$search}
					<div class="text-white text-sm font-bold p-2">Suggested Products</div>
				{/if}
				<div class="grid grid-cols-1">
					{#each filteredProducts as product (product.id)}
						{@const productCoordinates = parseCoordinatesString(`${KindProducts}:${product.userId}:${product.id}`)}
						<a
							href={product.userNip05
								? `/products/${product.userNip05}/${product.identifier}`
								: `/products/${productCoordinates.coordinates}`}
							class="flex items-center gap-4 p-2 hover:bg-black/50 rounded-lg transition-colors"
							on:click={() => {
								showResults = false
							}}
						>
							<div class="flex-1 text-sm">
								<p class="text-white">{product.name}</p>
							</div>
							{#if product.images?.length}
								{@const mainMedia = product.images?.sort((a, b) => a.imageOrder - b.imageOrder)[0]}
								<div class="w-8 h-8 relative flex-shrink-0">
									<img src={mainMedia.imageUrl} alt={product.name} class="absolute inset-0 w-full h-full object-cover rounded" />
								</div>
							{:else}
								<div class="flex items-center justify-center w-8 h-8 flex-shrink-0">
									<span
										style={`color:${stringToHexColor(String(product.name || product.identifier))}`}
										class="i-mdi-package-variant-closed w-4 h-4"
									/>
								</div>
							{/if}
						</a>
					{/each}
				</div>
			{:else}
				<div class="p-4 text-center text-white">
					{$search.trim() ? 'No results found...' : 'No products available'}
				</div>
			{/if}
		</div>
	{/if}
</div>
