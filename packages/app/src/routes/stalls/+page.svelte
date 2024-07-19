<script lang="ts">
	import CatMenu from '$lib/components/category/cat-menu.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'

	$: stallQuery = createStallsByFilterQuery({})
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
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
							{#each $stallQuery.data as item}
								<StallItem stallData={item} />
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>
