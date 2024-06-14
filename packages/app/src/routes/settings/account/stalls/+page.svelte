<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { page } from '$app/stores'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData

	let stallsMode: 'list' | 'create' | 'edit' = 'list'

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
	})

	$: stallsMode === 'list' ? $stallsQuery.refetch() : null

	let currentStall: RichStall | null = null
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	{#if stallsMode === 'list'}
		<div class="flex justify-between items-center">
			<div class=" flex items-center gap-1">
				<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				<section>
					<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
					<p class="text-gray-600">{linkDetails?.description}</p>
				</section>
			</div>
			<Button
				on:click={() => {
					stallsMode = 'create'
					currentStall = null
				}}
				variant="outline"
				class="border-2 border-black font-bold px-6">New</Button
			>
		</div>
	{:else if stallsMode === 'create' || stallsMode === 'edit'}
		<button class="w-fit" on:click={() => (stallsMode = 'list')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</button>
	{/if}
	<div class="flex flex-col gap-2">
		{#if stallsMode === 'list'}
			{#if $stallsQuery.isLoading}
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			{/if}
			{#each [...($stallsQuery.data ?? [])] as stall}
				<Button
					on:click={() => {
						stallsMode = 'edit'
						currentStall = stall
					}}
					class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
					variant="outline"
				>
					<div class="flex items-center gap-2">
						<span class="i-tdesign-store w-6 h-6" />
						<span>{stall.name}</span>
					</div>
				</Button>
			{/each}
		{:else if stallsMode === 'create' || stallsMode === 'edit'}
			<CreateEditStall stall={currentStall} on:success={() => (stallsMode = 'list')} />
		{/if}
	</div>
</div>
