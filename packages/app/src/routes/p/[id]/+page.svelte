<script lang="ts">
	import type { NormalizedData } from '$lib/nostrSubs/utils'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import autoAnimate from '@formkit/auto-animate'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import Nip05Badge from '$lib/components/cart/nip-05-badge.svelte'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import Hero from '$lib/components/common/hero.svelte'
	import InteractiveZapButton from '$lib/components/common/interactive-zap-button.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import SharingButton from '$lib/components/common/sharing-button.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import UserAlerts from '$lib/components/users/user-alerts.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchUserProductData, fetchUserStallsData, normalizeProductsFromNostr, normalizeStallData } from '$lib/nostrSubs/utils'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getHexColorFingerprintFromHexPubkey, handleBack, mergeWithExisting, truncateText } from '$lib/utils'
	import { ArrowLeft, Minus, Plus } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import { MetaTags } from 'svelte-meta-tags'

	import type { PageData } from './$types'

	export let data: PageData

	const { id, pageMetaTags } = data

	let nostrStalls: Partial<RichStall>[] = []
	let toDisplayProducts: Partial<DisplayProduct>[] = []
	let showFullAbout = false

	$: isMe = $ndkStore.activeUser?.pubkey == id
	$: userProfileQuery = createUserByIdQuery(id as string)
	$: stallsQuery = createStallsByFilterQuery({ userId: id, pageSize: getGridColumns($breakpoint, 'stall') * 4 })
	$: productsQuery = createProductsByFilterQuery({ userId: id, pageSize: getGridColumns($breakpoint, 'product') * 4 })
	$: stallsMixture = mergeWithExisting($stallsQuery?.data?.stalls ?? [], nostrStalls, 'id')
	$: productsMixture = stallsMixture.length
		? mergeWithExisting($productsQuery?.data?.products ?? [], toDisplayProducts, 'stall_id').filter((product) =>
				$stallsQuery.data?.stalls.some((stall) => stall.identifier == product.stall_id),
			)
		: []

	const handleSendMessage = () => {
		goto(`/dash/messages/${$page.params.id}`)
	}

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

		toDisplayProducts = productsData?.size ? ((await normalizeProductsFromNostr(productsData, id))?.toDisplayProducts ?? []) : []
	})
</script>

<MetaTags {...pageMetaTags} />

{#if $userProfileQuery.data}
	{@const { name, about, banner } = $userProfileQuery.data}
	<div class="relative">
		<Button variant="ghost" class="absolute top-4 left-4 z-10 flex items-center gap-2 text-white" on:click={handleBack}>
			<ArrowLeft class="w-4 h-4" />
			<span>Back</span>
		</Button>
		<div class="flex flex-col pb-4">
			<div>
				{#if banner}
					<div class="w-full aspect-[5/1] overflow-hidden flex items-center justify-center">
						<img src={banner} alt="stall-cover" class="w-full h-full object-cover" />
					</div>
				{:else}
					<Hero
						class={`border-black w-full border-2 aspect-[5/1] relative overflow-hidden`}
						gradientColor={getHexColorFingerprintFromHexPubkey(id)}
						gradientOpacity="0.6"
					></Hero>
				{/if}
				{#if about}
					{@const aboutTruncated = truncateText(about, 70)}
					<div class="flex flex-row items-center px-8 py-4 bg-lighter-black text-white text-sm" use:autoAnimate>
						{#if aboutTruncated !== about}
							{#if showFullAbout}
								<p class="break-words">{about}</p>
							{:else}
								<p class="break-words">{aboutTruncated}</p>
							{/if}
							<Button variant="primary" class="w-fit" size="icon" on:click={() => (showFullAbout = !showFullAbout)}>
								{#if showFullAbout}
									<Minus />
								{:else}
									<Plus />
								{/if}
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
							avatarClass="rounded-md w-8 h-8 border-none"
							imageClass="rounded-md w-full h-full"
							fallbackClass="rounded-md w-full h-full"
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
									<SharingButton
										title={$userProfileQuery.data?.name || 'Check out this user'}
										text={`Check out my profile on #plebeianmarket ${$userProfileQuery.data?.name}`}
										url={window.location.href}
									/>
									<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
									<Button size="icon" variant="primary" on:click={handleSendMessage}>
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
										<span>Sell A Product</span>
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
