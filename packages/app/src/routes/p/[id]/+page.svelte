<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { userFromNostrMutation } from '$lib/fetch/users.mutations'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { normalizeStallData } from '$lib/nostrSubs/subs'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'
	import { productEventSchema } from '../../../schema/nostr-events'

	let userProfile: NDKUserProfile | null
	let stalls: Partial<RichStall>[] | null
	let toDisplayProducts: Partial<DisplayProduct>[]
	export let data: PageData
	const { id, exist } = data

	// TODO keep working on this
	async function fetchUserData(userId: string): Promise<{
		stallNostrRes: Set<NDKEvent> | null
		userProfile: NDKUserProfile | null
		products: Set<NDKEvent> | null
	}> {
		const stallFilter = {
			kinds: [KindStalls],
			authors: [userId],
		}

		let stallNostrRes = await $ndkStore.fetchEvents(stallFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })
		const ndkUser = $ndkStore.getUser({
			pubkey: userId,
		})

		userProfile = await ndkUser.fetchProfile()
		userProfile && (userProfile.id = id as string)
		const productsFilter = {
			kinds: [KindProducts],
			authors: [userId],
		}
		const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })
		return { stallNostrRes, userProfile, products: productsNostrRes }
	}

	let isMe = false

	$: stallsQuery = exist
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : (id as string),
			})
		: undefined

	$: productsQuery = exist
		? createProductsByFilterQuery({
				userId: $ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : (id as string),
			})
		: undefined

	$: userProfileQuery = exist
		? createUserByIdQuery($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : (id as string))
		: undefined

	// $: categoriesQuery = createCategoriesByFilterQuery({ userId: pubkey })

	$: {
		if (exist) {
			if ($userProfileQuery?.data) userProfile = $userProfileQuery?.data
			if ($stallsQuery?.data) stalls = $stallsQuery.data
			if ($productsQuery?.data) toDisplayProducts = $productsQuery?.data
		}
		if ($ndkStore.activeUser?.pubkey) {
			isMe = $ndkStore.activeUser.pubkey === (id as string)
		}
	}

	onMount(async () => {
		if (!exist) {
			const { stallNostrRes, userProfile, products } = await fetchUserData(id as string)
			if (userProfile) await $userFromNostrMutation.mutateAsync({ profile: userProfile, pubkey: id as string })
			if (stallNostrRes) stalls = [...stallNostrRes].map(normalizeStallData).filter((stall): stall is Partial<RichStall> => stall !== null)
			if (products?.size) {
				toDisplayProducts = [...products].map((event) => {
					const product = productEventSchema.parse(JSON.parse(event.content))
					return {
						...product,
						images: product.images?.map((image) => ({
							createdAt: new Date(),
							productId: product.id,
							auctionId: null,
							imageUrl: image,
							imageType: 'gallery',
							imageOrder: 0,
						})),
					}
				})
			}
		}
	})
</script>

{#if userProfile}
	{@const { image, name } = userProfile}
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">
					<Pattern />
					<div class="w-fit z-10 justify-center">
						<div class="flex justify-center">
							<Avatar class="h-20 w-20">
								<AvatarImage src={image} alt="@shadcn" />
								<AvatarFallback>{name}</AvatarFallback>
							</Avatar>
						</div>
						<h2>{name}</h2>
						<div class="flex items-center">
							<Button variant="secondary" class="w-1/2 lg:w-auto">
								<code class="truncate">{npubEncode(id)}</code>
							</Button>
							<Button on:click={() => copyToClipboard(npubEncode(id))}>Copy</Button>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger><Button>Create...</Button></DropdownMenu.Trigger>
								<DropdownMenu.Content>
									<DropdownMenu.Group>
										<DropdownMenu.Item on:click={openDrawerForNewStall}>Create stall</DropdownMenu.Item>
										<DropdownMenu.Item on:click={openDrawerForNewProduct}>Create product</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</div>
				</div>
				<!-- {#if $categoriesQuery.data}
				<div class="py-5 lg:px-12">
					<div class="container">
						<h2>Categories</h2>
						<div class=" grid grid-cols-4 gap-2">
							{#each $categoriesQuery.data.filter((cat) => (cat.productCount ?? 0) > 0) as cat}
								<CatCompactItem {cat} userId={pubkey} />
							{/each}
						</div>
					</div>
				</div>
			{/if} -->
				{#if stalls}
					<div class="px-4 py-20 lg:px-12">
						<div class="container">
							<h2>Stalls</h2>
							<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
								{#each stalls as item}
									<StallItem stall={item} />
								{/each}
							</div>
						</div>
					</div>
				{/if}

				{#if toDisplayProducts}
					<div class="px-4 py-20 lg:px-12">
						<div class="container">
							<h2>Products</h2>
							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
								{#each toDisplayProducts as item}
									<ProductItem product={item} />
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</main>
		</div>
	</div>
{/if}
