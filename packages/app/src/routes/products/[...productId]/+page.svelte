<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { CarouselAPI } from '$lib/components/ui/carousel/context'
	import type { DisplayProduct } from '$lib/server/products.service'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Carousel from '$lib/components/ui/carousel'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery, createProductQuery, createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallExistsQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchProductData, fetchStallData, fetchUserData, normalizeProductsFromNostr, setNostrData } from '$lib/nostrSubs/utils'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import { cn, resolveQuery, stringToHexColor, truncateText } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	let api: CarouselAPI
	let count = 0
	let current = 0

	export let data: PageData
	$: ({
		user,
		productRes,
		appSettings: { allowRegister },
	} = data)
	let isMyProduct = false
	let toDisplayProducts: Partial<DisplayProduct>[]
	let userProfile: NDKUserProfile | null
	let userProducts: DisplayProduct[]
	let qtyToCart = 1

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	$: productsQuery = productRes.exist ? createProductQuery(productRes.id) : undefined

	$: userProfileQuery = user.exist ? createUserByIdQuery(user.id as string) : undefined

	$: priceQuery = toDisplayProducts
		? createCurrencyConversionQuery(toDisplayProducts[0].currency as string, toDisplayProducts[0].price as number)
		: undefined

	$: otherProducts = user.exist ? createProductsByFilterQuery({ userId: user.id, pageSize: 3 }) : undefined

	$: {
		if ($productsQuery?.data) {
			toDisplayProducts = [$productsQuery?.data]
		}
		if ($userProfileQuery?.data) {
			userProfile = $userProfileQuery?.data
		}
		if ($otherProducts?.data) {
			userProducts = $otherProducts.data.products
		}
	}

	$: if (api) {
		count = api.scrollSnapList().length
		current = api.selectedScrollSnap() + 1
		api.on('select', () => {
			current = api.selectedScrollSnap() + 1
		})
	}

	onMount(async () => {
		if (!productRes.exist && productRes.id) {
			const { userProfile: userData } = await fetchUserData(user.id as string)
			userData && (userProfile = userData)
			const { nostrProduct: productsData } = await fetchProductData(productRes.id as string)
			if (!productsData?.size) return
			if (productsData) {
				const result = await normalizeProductsFromNostr(productsData, user.id as string)
				if (result) {
					const { toDisplayProducts: _toDisplay } = result
					toDisplayProducts = _toDisplay
				}
			}
			const productStallId = JSON.parse(Array.from(productsData)[0]?.content as string).stall_id
			const { stallNostrRes } = await fetchStallData(`${KindStalls}:${user.id}:${productStallId}`)
			const stallExist = await resolveQuery(() => createStallExistsQuery(`${KindStalls}:${user.id}:${productStallId}`))
			await setNostrData(
				stallExist ? null : stallNostrRes,
				user.exist ? null : userData,
				stallExist ? null : productsData,
				allowRegister,
				user.id as string,
				user.exist,
			)
		}
	})

	const handleIncrement = () => {
		if (qtyToCart < toDisplayProducts[0].quantity) {
			qtyToCart++
		}
	}

	const handleDecrement = () => {
		if (qtyToCart > 1) {
			qtyToCart--
		}
	}
</script>

{#if toDisplayProducts}
	<div class="container">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				{#key toDisplayProducts[0].identifier}
					{#if toDisplayProducts[0]?.images?.length}
						{@const sortedImages = toDisplayProducts[0].images.slice().sort((a, b) => a.imageOrder - b.imageOrder)}
						<Carousel.Root bind:api>
							<Carousel.Content>
								{#each sortedImages as item, i}
									<Carousel.Item>
										<img class="w-full h-auto" src={item.imageUrl} alt="" />
									</Carousel.Item>
								{/each}
							</Carousel.Content>
							<Carousel.Previous class="ml-14" />
							<Carousel.Next class="mr-14" />
						</Carousel.Root>
						<div class="text-center text-sm text-muted-foreground overflow-auto flex flex-col">
							<div>
								{#each sortedImages as item, i}
									<button
										class={cn('w-32 object-cover aspect-square cursor-pointer p-1', i === current - 1 ? 'border border-primary' : null)}
										on:click={() => api?.scrollTo(i)}
									>
										<img src={item.imageUrl} alt="" />
									</button>
								{/each}
							</div>
							Image {current} of {count}
						</div>
					{:else}
						<div class="h-full flex items-center justify-center border-2 border-black">
							<span
								style={`color:${stringToHexColor(String(toDisplayProducts[0].name || toDisplayProducts[0].identifier))}`}
								class=" i-mdi-package-variant-closed w-16 h-16"
							></span>
						</div>
					{/if}
				{/key}
			</div>
			<div class="flex flex-col">
				{#if isMyProduct}
					<Button class="w-1/4" on:click={() => openDrawerForProduct(productRes.id)}>Edit product</Button>
				{/if}
				<h1 class=" text-3xl">{toDisplayProducts[0].name}</h1>
				<h2 class=" inline-flex items-center text-2xl">
					{#if $priceQuery?.isLoading}
						<Spinner />
					{:else if $priceQuery?.data}
						{$priceQuery.data.toLocaleString('en-US', {
							maximumFractionDigits: 2,
						})}
					{/if}
					sats
				</h2>
				{#if toDisplayProducts[0].price && toDisplayProducts[0].currency && !['sat', 'sats', 'btc'].includes(toDisplayProducts[0].currency.toLowerCase())}
					<h3 class=" text-lg font-normal">
						{toDisplayProducts[0].price.toLocaleString('en-US', { style: 'currency', currency: toDisplayProducts[0].currency })}
						{toDisplayProducts[0].currency}
					</h3>
				{/if}
				<h3 class="my-8 font-bold">Stock: {toDisplayProducts[0].quantity}</h3>
				<div class="flex w-1/2 flex-row gap-1">
					<Button class="border-2 border-black" size="icon" variant="outline" on:click={handleDecrement} disabled={qtyToCart <= 1}>
						<span class="i-mdi-minus w-4 h-4"></span>
					</Button>
					<Input
						class="border-2 border-black w-16"
						type="number"
						value={qtyToCart}
						on:input={(e) => (qtyToCart = parseInt(e.target.value))}
						min="1"
						max={toDisplayProducts[0].quantity}
						readonly
					/>
					<Button
						class="border-2 border-black"
						size="icon"
						variant="outline"
						on:click={handleIncrement}
						disabled={qtyToCart >= toDisplayProducts[0].quantity}
					>
						<span class="i-mdi-plus w-4 h-4"></span>
					</Button>
					<Button
						class="ml-2"
						on:click={() =>
							handleAddToCart(String(toDisplayProducts[0].userId), String(toDisplayProducts[0].stallId), toDisplayProducts[0])}
						>Add to cart</Button
					>
				</div>
				<span class="my-8 font-bold"
					>Sold by <a href={`/p/${userProfile?.nip05 ? userProfile.nip05 : userProfile?.id ? userProfile?.id : user.id}`}
						><span class="underline">{userProfile?.name ? userProfile?.name : userProfile?.displayName}<span /></span></a
					>
				</span>
				{#if toDisplayProducts[0].description}
					<article>
						<h4 class="text-2xl font-bold">Details</h4>
						<p>
							{truncateText(toDisplayProducts[0].description)}
						</p>
					</article>
				{/if}
			</div>
		</div>
	</div>
	{#if toDisplayProducts[0].description}
		<div class="container bg-gray-50 flex flex-col items-center p-10">
			<Tabs.Root class="w-[45%]">
				<Tabs.List class="w-full justify-around bg-transparent">
					<Tabs.Trigger value="description" class={activeTab}>Description</Tabs.Trigger>
					<Tabs.Trigger disabled value="comments" class={activeTab}>Comments</Tabs.Trigger>
					<Tabs.Trigger disabled value="reviews" class={activeTab}>Reviews</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="description" class="flex flex-col gap-2">
					<p>{toDisplayProducts[0].description}</p>
				</Tabs.Content>
				<Tabs.Content value="comments" class="flex flex-col gap-2"></Tabs.Content>
				<Tabs.Content value="reviews" class="flex flex-col gap-2"></Tabs.Content>
			</Tabs.Root>
		</div>
	{/if}

	{#if userProducts}
		<div class="container py-12">
			<h2>More from {userProfile?.name}</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
				{#each userProducts as item}
					<ProductItem product={item} />
				{/each}
			</div>
		</div>
	{/if}
{/if}
