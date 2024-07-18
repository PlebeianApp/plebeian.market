<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { CarouselAPI } from '$lib/components/ui/carousel/context'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { beforeNavigate } from '$app/navigation'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ImgPlaceHolder from '$lib/components/product/imgPlaceHolder.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Carousel from '$lib/components/ui/carousel'
	import Input from '$lib/components/ui/input/input.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { KindStalls } from '$lib/constants'
	import { createProductPriceQuery, createProductQuery, createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallExistsQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchProductData, fetchStallData, fetchUserData, normalizeProductsFromNostr, setNostrData } from '$lib/nostrSubs/utils'
	import { addProduct } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import { cn, resolveQuery } from '$lib/utils'
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

	$: priceQuery = toDisplayProducts ? createProductPriceQuery(toDisplayProducts[0] as DisplayProduct) : undefined

	$: otherProducts = user.exist ? createProductsByFilterQuery({ userId: user.id }) : undefined

	$: {
		if ($productsQuery?.data) {
			toDisplayProducts = [$productsQuery?.data]
		}
		if ($userProfileQuery?.data) {
			userProfile = $userProfileQuery?.data
		}
		if ($otherProducts?.data) {
			userProducts = $otherProducts.data
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
				const result = normalizeProductsFromNostr(productsData, user.id as string)
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
				productsData,
				allowRegister,
				user.id as string,
				user.exist,
			)
		}
	})
	beforeNavigate(() => {
		toDisplayProducts[0].images = []
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
	<div class="container py-16">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="flex flex-col gap-4">
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
					<div class="py-2 text-center text-sm text-muted-foreground overflow-auto flex">
						<!-- Image {current} of {count} -->
						{#each sortedImages as item, i}
							<button
								class={cn('w-32 object-cover aspect-square cursor-pointer p-1', i === current - 1 ? 'border border-primary' : null)}
								on:click={() => api?.scrollTo(i)}
							>
								<img src={item.imageUrl} alt="" />
							</button>
						{/each}
					</div>
				{:else}
					<ImgPlaceHolder imageType={'main'} />
				{/if}
			</div>
			<div class="flex flex-col">
				{#if isMyProduct}
					<Button class="w-1/4" on:click={() => openDrawerForProduct(productRes.id)}>Edit product</Button>
				{/if}
				<h1>{toDisplayProducts[0].name}</h1>
				<h2 class=" inline-flex items-center">
					{#if $priceQuery?.isLoading}
						<Spinner />
					{:else if $priceQuery?.data}
						{$priceQuery.data}
					{/if}
					sats
				</h2>
				<h3>${toDisplayProducts[0].price} {toDisplayProducts[0].currency}</h3>

				<h3 class="my-8 font-bold">Stock: {toDisplayProducts[0].quantity}</h3>
				<div class="flex w-1/2 flex-row gap-4">
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
							addProduct(
								toDisplayProducts[0].userId,
								toDisplayProducts[0].stallId,
								{
									id: toDisplayProducts[0].id,
									name: toDisplayProducts[0].name,
									amount: qtyToCart,
									price: toDisplayProducts[0].price,
									stockQuantity: toDisplayProducts[0].quantity,
								},
								toDisplayProducts[0].currency,
							)}>Add to cart</Button
					>
				</div>
				<span class="my-8 font-bold"
					>Sold by <a href={`/p/${userProfile?.nip05 ? userProfile.nip05 : userProfile?.id ? userProfile?.id : user.id}`}
						><span class="underline">{userProfile?.name ? userProfile?.name : userProfile?.displayName}<span /></span></a
					>
				</span>
				<article>
					<h4 class="text-2xl font-bold">Details</h4>
					<p>
						{toDisplayProducts[0].description}
					</p>
					<!-- {#each productCats as cat}
					<a href={`/category/${cat.id}`}>
						<Badge>{cat.name}</Badge>
					</a>
				{/each} -->
				</article>
			</div>
		</div>
	</div>
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

	{#if userProducts}
		<div class="container py-20">
			<h2>More from {userProfile?.name}</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
				{#each userProducts as item}
					<ProductItem product={item} />
				{/each}
			</div>
		</div>
	{/if}
	<div class="w-full bg-primary py-20 text-center text-white">
		<span class="mb-8 text-3xl text-black">Join in on the fun!</span>
		<h1 class="text-black">Sell stuff for sats</h1>
		<Button class="p-6 text-xl font-bold">List my stuff</Button>
	</div>
{/if}
