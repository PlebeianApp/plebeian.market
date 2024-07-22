<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { page } from '$app/stores'
	import StallProductList from '$lib/components/product/stall-product-list.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { fetchUserStallsData, normalizeStallData } from '$lib/nostrSubs/utils'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { userExist, activeUser } = data
	let stalls: Partial<RichStall>[] | null
	let stallsMode: 'list' | 'create' | 'edit' = 'list'

	$: stallsQuery = userExist
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser?.pubkey,
			})
		: undefined

	$: {
		if ($stallsQuery?.data) {
			stalls = $stallsQuery?.data
		}
	}

	$: stallsMode === 'list' ? ($stallsQuery?.data ? $stallsQuery?.refetch() : null) : null

	let currentStall: Partial<RichStall> | null = null
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
	// TODO stalls from nostr are not beign loaded
	onMount(async () => {
		if (!activeUser?.id) return
		if (!userExist) {
			const { stallNostrRes } = await fetchUserStallsData(activeUser?.id)
			if (stallNostrRes) {
				const normalizedStallData = await Promise.all([...stallNostrRes].map(normalizeStallData)).then((results) =>
					results.filter((result) => result.data !== null).map((result) => result.data),
				)
				if (stalls?.length) {
					const newStalls = normalizedStallData.filter((stall) => !stalls?.some((existingStall) => stall.id === existingStall.id))
					stalls = [...stalls, ...newStalls] as Partial<RichStall>[]
				} else {
					stalls = normalizedStallData as Partial<RichStall>[]
				}
			}
		}
	})
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
			{#if $stallsQuery?.isLoading}
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			{:else if stalls?.length}
				{#each stalls as stall}
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
			<CreateEditStall stall={currentStall} on:success={() => (stallsMode = 'list')} />
		{/if}
	</div>
</div>
