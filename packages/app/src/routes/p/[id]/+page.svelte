<script lang="ts">
	import type { NormalizedData } from '$lib/nostrSubs/utils'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import InteractiveZapButton from '$lib/components/common/interactive-zap-button.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchUserProductData, fetchUserStallsData, normalizeProductsFromNostr, normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProduct } from '$lib/stores/drawer-ui'
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
	{@const { image, name, about, banner, pubkey, bio } = $userProfileQuery.data}
	<div class="relative">
		<div class="flex flex-col">
			{#if banner}
				<div class="w-full aspect-[6.125/1] overflow-hidden flex items-center justify-center">
					<img src={banner} alt="stall-cover" class="w-full h-full object-cover" />
				</div>
			{:else}
				<div
					style={`background-color: ${getHexColorFingerprintFromHexPubkey(id)}`}
					class={`border-black w-full border-2 aspect-[6.125/1] relative overflow-hidden`}
				/>
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
				{#if name}
					<div class="flex flex-row pt-4 gap-4">
						<a href={`/p/${pubkey}`}>
							<CAvatar
								pubkey={id}
								profile={$userProfileQuery.data}
								avatarClass="rounded-md w-8 h-8"
								imageClass="rounded-md w-8 h-8"
								fallbackClass="rounded-md w-8 h-8"
							/>
						</a>
						<h2 class="text-2xl text-white">{truncateText(name ?? `Unnamed user`, 50)}</h2>
					</div>
				{/if}
				<div class="flex flex-col">
					<div class="flex flex-row gap-2">
						<AdminActions type="user" {id} />
						{#if isMe}
							<Button variant="focus" class="w-full gap-2" on:click={openDrawerForNewProduct}>
								<span class="i-mdi-plus w-5 h-5" />
								<span>Add {productsMixture.length ? 'A' : 'Your First'} Product</span>
							</Button>
						{/if}
						<InteractiveZapButton userIdToZap={id} profile={$userProfileQuery.data} />
						<Button size="icon" variant="tertiary" on:click={handleSendMessage}>
							<span class="i-mdi-message-bubble w-6 h-6" />
						</Button>
					</div>
				</div>
			</div>
			{#if productsMixture.length}
				<ItemGrid title="Stall & Products">
					{#key stallsMixture}
						{#each productsMixture as item (item.id)}
							<ProductItem product={item} />
						{/each}
					{/key}
				</ItemGrid>
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
