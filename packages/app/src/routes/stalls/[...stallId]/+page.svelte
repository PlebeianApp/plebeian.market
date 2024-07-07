<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { Button } from '$lib/components/ui/button'
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import {
		fetchStallData,
		fetchUserData,
		fetchUserProductData,
		normalizeProductsFromNostr,
		normalizeStallData,
		setNostrData,
	} from '$lib/nostrSubs/utils'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getEventCoordinates, shouldRegister } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { stall, user, appSettings } = data
	let stallResponse: Partial<RichStall>
	let toDisplayProducts: Partial<DisplayProduct>[]
	let userProfile: NDKUserProfile | null

	$: stallsQuery =
		stall.exist && user.id
			? createStallsByFilterQuery({
					userId: user.id,
					stallId: stall.id,
				})
			: undefined

	$: productsQuery =
		stall.exist && user.id
			? createProductsByFilterQuery({
					stallId: stall.id,
				})
			: undefined

	$: userProfileQuery = user.exist ? createUserByIdQuery(user.id as string) : undefined

	$: {
		if ($userProfileQuery?.data) {
			userProfile = $userProfileQuery?.data
		}
	}

	$: {
		if ($stallsQuery?.data) {
			stallResponse = $stallsQuery?.data[0]
		}
	}

	$: if ($productsQuery?.data) toDisplayProducts = $productsQuery?.data

	onMount(async () => {
		if (user.id) {
			if (!stall.exist) {
				const { stallNostrRes: stallData } = await fetchStallData(stall.id)

				if (stallData) {
					const normalizedStall = normalizeStallData(stallData)
					if (normalizedStall) {
						stallResponse = normalizedStall
					}
				}

				const { userProfile: userData } = await fetchUserData(user.id as string)
				if (userData) {
					userProfile = userData
					stallResponse.userName = userData?.name || userData?.displayName
					stallResponse.userNip05 = userData?.nip05
				}

				const { products: productsData } = await fetchUserProductData(user.id)
				if (productsData?.size) {
					const result = normalizeProductsFromNostr(productsData, user.id as string, stall.id)
					if (result) {
						const { toDisplayProducts: _toDisplay } = result
						toDisplayProducts = _toDisplay
					}
				}

				await setNostrData(stallData, user.exist ? null : userData, productsData, appSettings.allowRegister, user.id, user.exist)
			} else {
				fetchUserProductData(user.id as string).then((data) => {
					const { products } = data
					const newProducts = new Set(
						[...(products as Set<NDKEvent>)].filter((product) => {
							const stallId = JSON.parse(product.content).stall_id
							if (stallId == stall.id.split(':')[2]) {
								const productId = getEventCoordinates(product).coordinates
								return !toDisplayProducts.some((displayProduct) => displayProduct.id?.includes(productId))
							}
						}),
					)
					setNostrData(null, null, newProducts, appSettings.allowRegister, user.id as string, user.exist).then((data) => {
						data?.productsInserted && $productsQuery?.refetch()
					})
				})
			}
		}
	})

	let isMyStall = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyStall = $ndkStore.activeUser?.pubkey === user.id
		}
	}
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="flex w-full flex-col items-center bg-black py-20 gap-2 text-center text-white">
				<section class="w-fit">
					{#if userProfile}
						<a href={`/p/${userProfile?.nip05 ? userProfile?.nip05 : user.id}`} class="flex flex-col items-center">
							<Avatar>
								<AvatarImage src={userProfile?.image} alt="@shadcn" />
								<AvatarFallback>{userProfile?.name?.substring(0, 2)}</AvatarFallback>
							</Avatar>
							<span>{userProfile?.name ? userProfile?.name : userProfile?.displayName}</span>
						</a>
					{:else}
						<Skeleton class="h-24 w-24 rounded-full" />
					{/if}
				</section>
				{#if stallResponse}
					<h1>{stallResponse.name}</h1>
					<p class="text-2xl">{stallResponse.description}</p>
					<Accordion.Root class="w-full sm:max-w-sm">
						<Accordion.Item value="item-1">
							<Accordion.Trigger>More info</Accordion.Trigger>
							<Accordion.Content>
								<div class=" flex flex-col gap-2 items-start">
									{#if stallResponse.shipping?.length}
										<span class=" font-bold">Shipping zones</span>
										<section class=" flex gap-2 flex-wrap">
											{#each stallResponse.shipping as shipping}
												{#if shipping.name || shipping.id}
													<span>{shipping.name || shipping.id}</span>
												{/if}
												{#if shipping.zones}
													{#each shipping.zones as zone}
														<Badge variant="secondary">{zone.country ? zone.country : zone.region}</Badge>
													{/each}
												{/if}
											{/each}
										</section>
									{/if}
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>

					{#if isMyStall}
						<Button class="mt-4" on:click={() => openDrawerForProduct(stall.id)}>Edit stall</Button>
					{/if}
				{:else}
					<section class=" flex flex-col gap-2">
						<Skeleton class="h-8 w-[250px]" />
						<Skeleton class="h-8 w-[250px]" />
						<Skeleton class="h-8 w-[250px]" />
					</section>
				{/if}
			</div>

			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					{#if stallResponse}
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#if toDisplayProducts}
								{#each toDisplayProducts as item}
									<ProductItem product={item} />
								{/each}
							{/if}
						</div>
					{:else}
						<div class=" flex gap-4">
							<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
							<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
							<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
							<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>
