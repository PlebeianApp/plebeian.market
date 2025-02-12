<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import SkeletonLoader from '$lib/components/common/skeletonLoader.svelte'
	import StallProductList from '$lib/components/product/stall-product-list.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { fetchUserStallsData, normalizeStallData } from '$lib/nostrSubs/utils'
	import ndkStore from '$lib/stores/ndk'
	import { mergeWithExisting } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData

	let stallsMode: 'list' | 'create' | 'edit' = 'list'
	let nostrStalls: Partial<RichStall>[] = []

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
		pageSize: 999,
	})
	$: stallsMixture = mergeWithExisting($stallsQuery?.data?.stalls ?? [], nostrStalls, 'identifier')

	$: stallsMode === 'list' ? $stallsQuery?.refetch() : null

	let currentStall: Partial<RichStall> | null = null
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	$: if (stallsMode === 'edit' && stallsMixture && currentStall) {
		const updatedStall = stallsMixture.find((stall) => stall.identifier === currentStall?.identifier)
		if (updatedStall) {
			currentStall = updatedStall
		}
	}

	onMount(async () => {
		if (!$ndkStore.activeUser?.pubkey) return
		try {
			const { stallNostrRes } = await fetchUserStallsData($ndkStore.activeUser.pubkey)
			if (stallNostrRes) {
				nostrStalls = (await Promise.all([...stallNostrRes].map(normalizeStallData)))
					.map(({ data }) => data as Partial<RichStall>)
					.filter(Boolean)
			}
		} catch (error) {
			console.error('Error fetching and processing stalls:', error)
		}
	})
</script>

<div class="pb-4 space-y-2">
	{#if stallsMode === 'list'}
		<div class="flex justify-between items-center">
			<Button
				id="create-new-stall"
				on:click={() => {
					stallsMode = 'create'
					currentStall = null
				}}
				variant="outline"
				class="border-2 border-black font-bold px-6">New</Button
			>
		</div>
	{:else if stallsMode === 'create' || stallsMode === 'edit'}
		<Button variant="primary" id="create-edit-back-button" class="w-fit" on:click={() => (stallsMode = 'list')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
	{/if}
	<div class="flex flex-col gap-2">
		{#if stallsMode === 'list'}
			{#if $stallsQuery?.isLoading}
				<SkeletonLoader count={3} class="h-12 w-full" />
			{:else if stallsMixture?.length}
				{#each stallsMixture as stall}
					<Collapsible.Root class="border-black border p-2">
						<div class="flex flex-row">
							<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2">
								<div class="flex items-center gap-2 font-bold">
									<span class="i-tdesign-store w-6 h-6" />
									<span>{stall.name}</span>
								</div>
								<span class="i-mdi-keyboard-arrow-down w-6 h-6" />
							</Collapsible.Trigger>
							<Button
								on:click={() => {
									stallsMode = 'edit'
									currentStall = stall
								}}
								class="cursor-pointer border border-gray font-bold"
								variant="outline"
								size="icon"
							>
								<span class="i-mdi-pencil-outline w-6 h-6" />
							</Button>
						</div>

						<Collapsible.Content class="flex flex-col gap-4 py-4">
							<StallProductList {stall} />
						</Collapsible.Content>
					</Collapsible.Root>
				{/each}
			{/if}
		{:else if stallsMode === 'create' || stallsMode === 'edit'}
			<CreateEditStall
				stall={currentStall}
				on:success={() => {
					stallsMode = 'list'
				}}
			/>
		{/if}
	</div>
</div>
