<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { stallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { userFromNostrMutation } from '$lib/fetch/users.mutations'
	import { stallsSub } from '$lib/nostrSubs/subs'
	import { productsFilterSchema, stallsFilterSchema } from '$lib/schema'
	import ndkStore from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'
	import { productEventSchema } from '../../../schema/nostr-events'

	export let data: PageData
	const { stall, user } = data
	let stallResponse: Partial<RichStall>
	let toDisplayProducts: Partial<DisplayProduct>[]
	let userProfile: NDKUserProfile | null

	async function fetchStallData(
		stallId: string,
		userId: string,
	): Promise<{
		stallNostrRes: NDKEvent | null
		userProfile: NDKUserProfile | null
		products: Set<NDKEvent> | null
	}> {
		const fetchedStall = $stallsSub.find((nostrStall) => stallId.split(':')[2] == nostrStall.dTag)
		const stallFilter = {
			kinds: [KindStalls],
			authors: [userId],
			'#d': [stallId.split(':')[2]],
		}

		let stallNostrRes: NDKEvent | null = fetchedStall ? fetchedStall : await $ndkStore.fetchEvent(stallFilter)
		stallResponse = JSON.parse(stallNostrRes?.content ?? '{}')
		const ndkUser = $ndkStore.getUser({
			pubkey: userId,
		})

		userProfile = await ndkUser.fetchProfile()
		userProfile && (userProfile.id = data.user.id)
		stallResponse.userId = userId
		stallResponse.userName = userProfile?.name || userProfile?.displayName
		stallResponse.userNip05 = userProfile?.nip05

		const productsFilter = {
			kinds: [KindProducts],
			authors: [userId],
		}
		const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

		return { stallNostrRes, userProfile, products: productsNostrRes }
	}

	async function fetchStallDataFromDb(stallId: string) {
		createStallsByFilterQuery(stallsFilterSchema.parse({ stallId: stallId })).subscribe((stallRes) => {
			if (stallRes.data) {
				stallResponse = stallRes.data[0]
			}
		})
		createProductsByFilterQuery(productsFilterSchema.parse({ stallId: stallId })).subscribe((productsRes) => {
			if (productsRes.data?.length) {
				toDisplayProducts = productsRes.data
			}
		})
	}

	onMount(async () => {
		if (!stall.exist) {
			const { stallNostrRes, userProfile, products } = await fetchStallData(stall.id, user.id as string)
			if (userProfile) await $userFromNostrMutation.mutateAsync({ profile: userProfile, pubkey: user.id as string })
			if (stallNostrRes) {
				const stallEvent = await stallNostrRes.toNostrEvent()
				await $stallFromNostrEvent.mutateAsync(stallEvent)
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
					await $createProductsFromNostrMutation.mutateAsync(products)
				}
			}
		} else {
			await fetchStallDataFromDb(stall.id)
		}
	})
</script>

{#if stallResponse}
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
					<section class="w-fit">
						<a href={`/p/${stallResponse.userNip05 ? stallResponse.userNip05 : stallResponse.userId}`} class="flex flex-col items-center">
							<Avatar>
								<AvatarImage src={userProfile?.image} alt="@shadcn" />
								<AvatarFallback>{userProfile?.name?.substring(0, 2)}</AvatarFallback>
							</Avatar>
							<span>{stallResponse.userName}</span>
						</a>
					</section>
					<h1>{stallResponse.name}</h1>
					<p class="text-2xl">{stallResponse.description}</p>

					<Accordion.Root class="w-full sm:max-w-sm">
						<Accordion.Item value="item-1">
							<Accordion.Trigger>More info</Accordion.Trigger>
							<Accordion.Content>
								<div class=" flex flex-col gap-2 items-start">
									<span>Shipping zones</span>
									<!-- <section class=" flex gap-2 flex-wrap">
									{#each zones as zone}
										<Badge variant="secondary">{zone.region}</Badge>
									{/each}
								</section> -->
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#if toDisplayProducts}
								{#each toDisplayProducts as item}
									<ProductItem product={item} />
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
{:else}
	wops
{/if}
