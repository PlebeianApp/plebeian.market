<script lang="ts">
	import type { NormalizedData } from '$lib/nostrSubs/utils'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import InteractiveZapButton from '$lib/components/common/interactive-zap-button.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchUserProductData, fetchUserStallsData, normalizeProductsFromNostr, normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { mergeWithExisting, truncateText } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { id } = data
	let nostrStalls: Partial<RichStall>[] = []
	let toDisplayProducts: Partial<DisplayProduct>[] = []
	let showFullAbout = false

	$: isMe = $ndkStore.activeUser?.pubkey == id
	$: userProfileQuery = createUserByIdQuery(id as string)
	$: stallsQuery = createStallsByFilterQuery({ userId: id })
	$: productsQuery = createProductsByFilterQuery({ userId: id })
	$: stallsMixture = mergeWithExisting($stallsQuery?.data?.stalls ?? [], nostrStalls, 'id')
	$: productsMixture = stallsMixture.length
		? mergeWithExisting($productsQuery?.data?.products ?? [], toDisplayProducts, 'stall_id').filter((product) =>
				$stallsQuery.data?.stalls.some((stall) => stall.identifier == product.stall_id),
			)
		: []

	onMount(async () => {
		if (!id) return
		const [{ stallNostrRes }, { products: productsData }] = await Promise.all([fetchUserStallsData(id), fetchUserProductData(id)])
		nostrStalls = stallNostrRes
			? (await Promise.all([...stallNostrRes].map(normalizeStallData)))
					.filter(
						(result): result is NormalizedData<RichStall> & { data: Partial<RichStall> } => result.data !== null && result.error === null,
					)
					.map(({ data }) => data)
			: []

		toDisplayProducts = productsData?.size ? (await normalizeProductsFromNostr(productsData, id))?.toDisplayProducts ?? [] : []
	})

	const handleSendMessage = () => {
		goto(`/dash/messages/${$page.params.id}`)
	}
</script>

{#if $userProfileQuery.data}
	{@const { image, name, about, banner } = $userProfileQuery.data}
	<div class="px-4 lg:px-12">
		<div class="flex flex-col gap-14">
			<div class="relative h-auto">
				{#if banner}
					<img src={banner} alt="profile" class="border-black border-2 object-cover w-full h-[25vh]" />
				{:else}
					<div style={`background-color: #${id?.substring(0, 6)}`} class="h-[10vh] border-2 border-black"></div>
				{/if}

				<div class="grid lg:grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 mt-8 justify-between">
					<div class="px-2">
						<CAvatar pubkey={id} profile={$userProfileQuery.data} />
					</div>
					<div class="flex flex-col">
						<div class="flex flex-row gap-2">
							<h1 class="text-3xl">{name ?? `Unnamed user`}</h1>
							<AdminActions type="user" {id} />
						</div>
						{#if about}
							{@const truncatedAbout = truncateText(about)}
							{#if truncatedAbout !== about}
								<p class="break-words">{showFullAbout ? about : truncatedAbout}</p>
								<Button variant="outline" size="icon" on:click={() => (showFullAbout = !showFullAbout)}>
									<span class={showFullAbout ? 'i-mdi-minus' : 'i-mdi-plus'} />
								</Button>
							{:else}
								<p class="break-words">{about}</p>
							{/if}
						{/if}
					</div>
					<div class="flex flex-col">
						<div class="flex flex-row gap-2">
							{#if isMe}
								<Button variant="outline" class="w-full bg-focus hover:bg-yellow-500 gap-2" on:click={openDrawerForNewProduct}>
									<span class="i-mdi-plus w-5 h-5" />
									<span>Add {productsMixture.length ? 'a' : 'Your First'} Product</span>
								</Button>
							{/if}
							<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
							<Button size="icon" variant="tertiary" on:click={handleSendMessage}>
								<span class="i-mdi-message-bubble w-6 h-6" />
							</Button>
						</div>
					</div>
				</div>
			</div>
			{#if stallsMixture.length}
				<div class="container">
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						{#key stallsMixture}
							{#each stallsMixture as item (item.id)}
								<StallItem stallData={item} />
							{/each}
						{/key}
					</div>
				</div>
			{:else}
				<div class="container bg-muted p-16 flex flex-col items-center justify-center h-[12vh] max-w-fit">
					<div class="flex flex-row gap-2 items-center">
						Once you’ve <Button variant="link" class="p-0" on:click={openDrawerForNewStall}>added a stall</Button> they will be displayed here
					</div>
				</div>
			{/if}

			{#if productsMixture.length}
				<div class="container">
					<h2>Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each productsMixture as item (item.id)}
							<ProductItem product={item} />
						{/each}
					</div>
				</div>
			{:else if stallsMixture.length}
				<div class="container bg-muted p-16 flex flex-col items-center justify-center h-[12vh] max-w-fit">
					<div class="flex flex-row gap-2 items-center">
						Once you’ve <Button variant="link" class="p-0" on:click={openDrawerForNewProduct}>added a product</Button> they will be displayed
						here
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
