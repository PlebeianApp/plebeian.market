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
	import { openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getEventCoordinates, stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { stall, user, appSettings } = data
	let stallResponse: Partial<RichStall>
	let toDisplayProducts: Partial<DisplayProduct>[]
	let userProfile: NDKUserProfile | null
	let showFullDescription = false

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
					const normalizedStall = (await normalizeStallData(stallData)).data
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
					const result = await normalizeProductsFromNostr(productsData, user.id as string, stall.id)
					if (result) {
						const { toDisplayProducts: _toDisplay } = result
						toDisplayProducts = _toDisplay
					}
				}

				await setNostrData(stallData, user.exist ? null : userData, productsData, appSettings.allowRegister, user.id, user.exist, false)
			} else {
				fetchUserProductData(user.id as string).then((data) => {
					const { products } = data
					const newProducts = new Set(
						[...(products as Set<NDKEvent>)].filter((product) => {
							const stallId = JSON.parse(product.content).stall_id
							if (stallId == stall.id.split(':')[2]) {
								const productId = getEventCoordinates(product)?.coordinates
								return productId && !toDisplayProducts.some((displayProduct) => displayProduct.id?.includes(productId))
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

<main class="px-4 lg:px-12">
	<div class="flex flex-col gap-14">
		{#if stallResponse}
			<div class="flex flex-col gap-2">
				{#if stallResponse.image}
					<div class="border-black border-2 w-full h-[25vh] relative overflow-hidden">
						<img src={stallResponse.image} alt="profile" class="absolute top-0 left-0 w-full h-full object-cover object-top" />
					</div>
				{:else}
					<div
						style={`background-color: ${stringToHexColor(stall.id)}`}
						class={`border-black w-full border-2 h-[10vh] relative overflow-hidden`}
					/>
				{/if}
				{#if stallResponse.name}
					<h1 class="text-3xl">{stallResponse.name}</h1>
				{/if}

				{#if stallResponse.description}
					{@const _description = truncateText(stallResponse.description, 256)}
					{#if _description !== stallResponse.description}
						<p class="break-words">{showFullDescription ? stallResponse.description : _description}</p>
						<Button variant="outline" size="icon" on:click={() => (showFullDescription = !showFullDescription)}>
							{#if !showFullDescription}
								<span class=" i-mdi-plus" />
							{:else}
								<span class=" i-mdi-minus" />
							{/if}
						</Button>
					{:else}
						<p class="break-words">{stallResponse.description}</p>
					{/if}
				{/if}
			</div>
			<div class="flex flex-row gap-12">
				<section class="w-fit">
					{#if userProfile}
						<a href={`/p/${userProfile?.nip05 ? userProfile?.nip05 : user.id}`} class="flex flex-col items-center">
							<Avatar>
								<AvatarImage src={userProfile?.image} alt="@shadcn" />
								<AvatarFallback
									style={`background-color: ${stringToHexColor(String(userProfile?.name ? userProfile?.name : userProfile?.displayName))}`}
									><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback
								>
							</Avatar>
							<span>{userProfile?.name ? userProfile?.name : userProfile?.displayName}</span>
						</a>
					{:else}
						<Skeleton class="h-24 w-24 rounded-full" />
					{/if}
				</section>
				<Accordion.Root class="w-full sm:max-w-sm">
					<Accordion.Item value="item-1">
						<Accordion.Trigger>More info</Accordion.Trigger>
						<Accordion.Content>
							<div class=" flex flex-col gap-2 items-start">
								{#if stallResponse.shipping?.length}
									<span class=" font-bold">Shipping zones</span>
									<section class="gap-2">
										{#each stallResponse.shipping as shipping}
											<div class=" flex gap-2">
												{#if shipping.name || shipping.id}
													<span>{truncateString(shipping.name || shipping.id || '')}</span>
												{/if}
												{#if shipping.regions}
													{#each shipping.regions as region}
														<Badge variant="secondary">{region}</Badge>
													{/each}
												{/if}
												{#if shipping.countries}
													{#each shipping.countries as country}
														<Badge variant="secondary">{country}</Badge>
													{/each}
												{/if}
											</div>
										{/each}
									</section>
								{/if}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
				<div class="flex flex-col">
					<span>currency: {stallResponse.currency}</span>
					<span>created: {stallResponse.createDate}</span>
				</div>
			</div>

			{#if isMyStall}
				<Button class="mt-4 w-fit" on:click={() => openDrawerForStall(stall.id)}>Edit stall</Button>
			{/if}
		{:else}
			<section class=" flex flex-col gap-2">
				{#each [...Array(6)] as _, i}
					<Skeleton class="h-8 w-[250px]" />
				{/each}
			</section>
		{/if}
	</div>
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
			{#each [...Array(3)] as _, i}
				<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
			{/each}
		</div>
	{/if}
</main>
