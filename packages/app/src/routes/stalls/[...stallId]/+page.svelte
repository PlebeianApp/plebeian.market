<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { Button } from '$lib/components/ui/button'
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'
	import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createShippingQuery } from '$lib/fetch/shipping.queries'
	import { createStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { userFromNostr } from '$lib/fetch/users.mutations'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchStallData, fetchUserData, fetchUserProductData } from '$lib/nostrSubs/utils'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getEventCoordinates } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { ProductImagesType } from '@plebeian/database'

	import type { PageData } from './$types'
	import { productEventSchema, shippingObjectSchema } from '../../../schema/nostr-events'

	export let data: PageData
	const { stall, user, appSettings } = data
	let stallResponse: Partial<RichStall>
	let toDisplayProducts: Partial<DisplayProduct>[]
	let userProfile: NDKUserProfile | null
	let shippingResponse: Partial<RichShippingInfo>[]

	$: stallsQuery = stall.exist
		? createStallsByFilterQuery({
				userId: user.id,
				stallId: stall.id,
			})
		: undefined

	$: productsQuery = stall.exist
		? createProductsByFilterQuery({
				stallId: stall.id,
			})
		: undefined

	$: userProfileQuery = user.exist ? createUserByIdQuery(user.id as string) : undefined

	$: shippingQuery = stall.exist ? createShippingQuery(stall.id) : undefined

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

	$: if ($shippingQuery?.data) shippingResponse = $shippingQuery.data

	async function setNostrData(
		stallData: NDKEvent | null,
		userData: NDKUserProfile | null,
		productsData: Set<NDKEvent> | null,
		allowRegister: boolean = false,
	): Promise<{ userInserted: boolean; stallInserted: boolean; productsInserted: boolean } | undefined> {
		let userInserted: boolean = false
		let stallInserted: boolean = false
		let productsInserted: boolean = false
		try {
			if (userData) {
				userData && (userData.id = user.id)
				userProfile = userData
				if (allowRegister) {
					const userMutation = await $userFromNostr.mutateAsync({ profile: userData, pubkey: user.id as string })
					userMutation && (userInserted = true)
				}
			}

			if (stallData) {
				stallResponse = JSON.parse(stallData?.content ?? '{}')
				const parsedShipping =
					stallResponse.shipping?.map((shipping) => {
						const { data: shippingData } = shippingObjectSchema.safeParse(shipping)
						if (shippingData) return shippingData
					}) ?? []
				shippingResponse = parsedShipping.map((shipping) => ({
					id: shipping?.id,
					name: shipping?.name as string,
					cost: shipping?.cost,
					zones: shipping?.regions?.map((zone) => ({
						region: zone,
						country: zone,
					})),
				}))
				stallResponse.userId = user.id
				stallResponse.userName = userData?.name || userData?.displayName
				stallResponse.userNip05 = userData?.nip05
				if (allowRegister) {
					const stallEvent = await stallData.toNostrEvent()
					const stallMutation = await $createStallFromNostrEvent.mutateAsync(stallEvent)
					if (stallMutation) {
						shippingQuery = createShippingQuery(stall.id)
						stallInserted = true
					}
				}
			}
			if (productsData?.size) {
				const stallProducts = new Set<NDKEvent>()
				toDisplayProducts = []
				for (const event of productsData) {
					const product = productEventSchema.parse(JSON.parse(event.content))
					if (product.stall_id == stall.id.split(':')[2]) {
						stallProducts.add(event)
						toDisplayProducts.push({
							...product,
							quantity: product.quantity as number,
							images: product.images?.map((image) => ({
								createdAt: new Date(),
								productId: product.id,
								auctionId: null,
								imageUrl: image,
								imageType: 'gallery' as ProductImagesType,
								imageOrder: 0,
							})),
							userId: user.id,
						})
					}
				}
				if (allowRegister) {
					const productsMutation = await $createProductsFromNostrMutation.mutateAsync(stallProducts)
					productsMutation && (productsInserted = true)
				}
			}
			return { userInserted, stallInserted, productsInserted }
		} catch (e) {
			console.error(e)
			return undefined
		}
	}

	onMount(async () => {
		if (!stall.exist) {
			const { stallNostrRes } = await fetchStallData(stall.id)
			const { userProfile } = user.exist ? { userProfile: null } : await fetchUserData(user.id as string)
			const { products } = await fetchUserProductData(user.id as string)
			if (products?.size) await setNostrData(stallNostrRes, userProfile, products, appSettings.allowRegister)
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
				setNostrData(null, null, newProducts, appSettings.allowRegister).then((data) => {
					data?.productsInserted && $productsQuery?.refetch()
				})
			})
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
									{#if shippingResponse}
										<span class=" font-bold">Shipping zones</span>
										<section class=" flex gap-2 flex-wrap">
											{#each shippingResponse as shipping}
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
