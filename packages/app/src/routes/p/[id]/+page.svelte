<script lang="ts">
	import type { NormalizedData } from '$lib/nostrSubs/utils'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
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

{#if $userProfileQuery.data}
	{@const { name, about, banner } = $userProfileQuery.data}
	<div class="relative">
		<div class="flex flex-col gap-6 pb-4">
			<div>
				{#if banner}
					<div class="w-full aspect-[6.125/1] overflow-hidden flex items-center justify-center">
						<img src={banner} alt="stall-cover" class="w-full h-full object-cover" />
					</div>
				{:else}
					<Hero
						class={`border-black w-full border-2 aspect-[6.125/1] relative overflow-hidden`}
						gradientColor={getHexColorFingerprintFromHexPubkey(id)}
						gradientOpacity="0.6"
					></Hero>
				{/if}
				{#if about}
					<div class="flex flex-col px-8 py-4 bg-lighter-black text-white">
						{#if truncateText(about) !== about}
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
						<h2 class="text-2xl text-white">{truncateText(name ?? `Unnamed user`, 50)}</h2>
					</div>
					{#if $breakpoint !== 'sm'}
						<div class="flex flex-col">
							<div class="flex flex-row gap-2">
								<AdminActions type="user" {id} />
								{#if isMe}
									{#if stallsMixture.length && productsMixture.length}
										<Button variant="primary" class="w-full gap-2" on:click={openDrawerForNewStall}>
											<span>New Stall</span>
										</Button>
										<Button variant="focus" class="w-full gap-2" on:click={openDrawerForNewProduct}>
											<span>Add {productsMixture.length ? 'A' : 'Your First'} Product</span>
										</Button>
									{/if}
								{/if}
								<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
								<Button size="icon" variant="tertiary" on:click={handleSendMessage}>
									<span class="i-mdi-message-bubble w-6 h-6" />
								</Button>
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
				<UserAlerts stalls={stallsMixture} products={productsMixture} />
			</div>
			<div class=" flex flex-col gap-1">
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
				{#if stallsMixture.length}
					<ItemGrid title="Stalls">
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
{/if}
