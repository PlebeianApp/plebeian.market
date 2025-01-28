<script lang="ts">
	import type { NormalizedData } from '$lib/nostrSubs/utils'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Nip05Badge from '$lib/components/cart/nip-05-badge.svelte'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import Hero from '$lib/components/common/hero.svelte'
	import InteractiveZapButton from '$lib/components/common/interactive-zap-button.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import UserAlerts from '$lib/components/users/user-alerts.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchUserProductData, fetchUserStallsData, normalizeProductsFromNostr, normalizeStallData } from '$lib/nostrSubs/utils'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getHexColorFingerprintFromHexPubkey, mergeWithExisting, truncateText } from '$lib/utils'
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

<svelte:head>
	{#if $userProfileQuery.data}
		<title>{$userProfileQuery.data.name || $userProfileQuery.data.displayName || 'Profile'}</title>
		<meta property="og:title" content={$userProfileQuery.data.name || $userProfileQuery.data.displayName || 'Profile'} />
		<meta property="og:site_name" content="Plebeian market" />
		<meta property="og:url" content={`https://plebeian.market/p/${$userProfileQuery.data?.id}`} />
		<meta property="og:type" content="profile" />
		<meta property="og:description" content={$userProfileQuery.data.about || 'Check out my profile and products!'} />
		{#if $userProfileQuery.data.image}
			<meta property="og:image" content={$userProfileQuery.data.image} />
		{/if}
		{#if $userProfileQuery.data.name}
			<meta property="profile:username" content={$userProfileQuery.data.name} />
		{/if}
	{/if}
</svelte:head>

{#if $userProfileQuery.data}
	{@const { name, about, banner } = $userProfileQuery.data}
	<div class="relative">
		<div class="flex flex-col pb-4">
			<div>
				{#if banner}
					<div class="w-full aspect-[5/1] overflow-hidden flex items-center justify-center">
						<img src={banner} alt="stall-cover" class="w-full h-full object-cover" />
					</div>
				{:else}
					<Hero
						class={`border-black w-full border-2 aspect-[3/1] relative overflow-hidden`}
						gradientColor={getHexColorFingerprintFromHexPubkey(id)}
						gradientOpacity="0.6"
					></Hero>
				{/if}
				{#if about}
					<div class="flex flex-col px-8 py-4 bg-lighter-black text-white text-sm">
						{#if truncateText(about, 50) !== about}
							<Button variant="outline" class="w-fit" size="icon" on:click={() => (showFullAbout = !showFullAbout)}>
								<span class={showFullAbout ? 'i-mdi-minus' : 'i-mdi-plus'} />
							</Button>
						{:else}
							<p class="break-words">{about}</p>
						{/if}
					</div>
				{/if}
				<div class="flex flex-row justify-between px-8 bg-off-black items-center">
					<div class="flex flex-row pt-4 gap-4">
						<CAvatar
							pubkey={id}
							profile={$userProfileQuery.data}
							avatarClass="rounded-md w-8 h-8"
							imageClass="rounded-md w-8 h-8"
							fallbackClass="rounded-md w-8 h-8"
							linked
						/>
						<h2 class="text-2xl text-white">{truncateText(name ?? `Unnamed user`, $breakpoint == 'sm' ? 10 : 50)}</h2>
						<Nip05Badge userId={id} />
					</div>
					{#if $breakpoint !== 'sm'}
						<div class="flex flex-col">
							<div class="flex flex-row gap-2">
								{#if isMe}
									{#if stallsMixture.length && productsMixture.length}
										<Button variant="primary" class="w-full gap-2" on:click={openDrawerForNewStall}>
											<span>New shop</span>
										</Button>
										<Button variant="focus" class="w-full gap-2" on:click={openDrawerForNewProduct}>
											<span>Add {productsMixture.length ? 'A' : 'Your First'} Product</span>
										</Button>
									{/if}
								{:else}
									<AdminActions type="user" {id} />
									<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
									<Button size="icon" variant="tertiary" on:click={handleSendMessage}>
										<span class="i-mdi-message-bubble w-6 h-6" />
									</Button>
								{/if}
							</div>
						</div>
					{:else}
						<div class="flex flex-col">
							<div class="flex flex-row gap-2">
								{#if !isMe}
									<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
									<Button size="icon" variant="tertiary" on:click={handleSendMessage}>
										<span class="i-mdi-message-bubble w-6 h-6" />
									</Button>
								{/if}
							</div>
						</div>
					{/if}
				</div>
				{#if isMe}
					<UserAlerts stalls={stallsMixture} products={productsMixture} />
				{/if}
			</div>
			<div class=" flex flex-col gap-1 mt-3">
				{#if $breakpoint == 'sm'}
					<div class="flex flex-col items-center">
						<div class="flex flex-col gap-2 w-[90%]">
							{#if isMe}
								{#if stallsMixture.length && productsMixture.length}
									<Button variant="focus" class=" gap-2" on:click={openDrawerForNewProduct}>
										<span>Add A Product</span>
									</Button>
									<Button variant="primary" class=" gap-2" on:click={openDrawerForNewStall}>
										<span>New Stall</span>
									</Button>
								{/if}
							{/if}
						</div>
					</div>
				{/if}
				<div class="mx-4">
					{#if stallsMixture.length}
						<ItemGrid title="Shops">
							{#key stallsMixture}
								{#each stallsMixture as item (item.id)}
									<StallItem stallData={item} />
								{/each}
							{/key}
						</ItemGrid>
					{/if}

					{#if productsMixture.length}
						<ItemGrid title="Products">
							{#key stallsMixture}
								{#each productsMixture as item (item.id)}
									<ProductItem product={item} />
								{/each}
							{/key}
						</ItemGrid>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
