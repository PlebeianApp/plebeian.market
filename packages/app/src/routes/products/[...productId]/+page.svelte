<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Carousel from '$lib/components/ui/carousel'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { createCurrencyConversionQuery, createProductQuery, createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import { cn, stringToHexColor, truncateText } from '$lib/utils'

	import type { PageData } from './$types'

	let api: CarouselAPI
	let count = 0
	let current = 0

	export let data: PageData
	$: ({ productRes, user } = data)
	let isMyProduct = false
	let qtyToCart = 1

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	$: productsQuery = createProductQuery(productRes.id)
	$: userProfileQuery = user.id ? createUserByIdQuery(user.id) : null

	$: priceQuery = createCurrencyConversionQuery($productsQuery.data?.currency as string, $productsQuery.data?.price as number)

	$: otherProducts = user.id ? createProductsByFilterQuery({ userId: user.id, pageSize: 3 }) : null

	$: if (api) {
		count = api.scrollSnapList().length
		current = api.selectedScrollSnap() + 1
		api.on('select', () => {
			current = api.selectedScrollSnap() + 1
		})
	}

	const handleIncrement = () => {
		if ($productsQuery.data?.quantity && qtyToCart < $productsQuery.data?.quantity) {
			qtyToCart++
		}
	}

	const handleDecrement = () => {
		if (qtyToCart > 1) {
			qtyToCart--
		}
	}
</script>

{#if $productsQuery.data && user.id}
	<div class="container">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 mb-4">
			<div class="flex flex-col gap-1">
				{#key $productsQuery.data.identifier}
					{#if $productsQuery.data?.images?.length}
						{@const sortedImages = $productsQuery.data.images.slice().toSorted((a, b) => a.imageOrder - b.imageOrder)}
						<Carousel.Root bind:api>
							<Carousel.Content>
								{#each sortedImages as item}
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
								style={`color:${stringToHexColor(String($productsQuery.data.name || $productsQuery.data.identifier))}`}
								class=" i-mdi-package-variant-closed w-16 h-16"
							></span>
						</div>
					{/if}
				{/key}
			</div>
			<div class="flex flex-col gap-2">
				{#if isMyProduct}
					<Button class="w-1/4" on:click={() => openDrawerForProduct(productRes.id)}>Edit product</Button>
				{/if}
				<h1 class=" text-3xl">{$productsQuery.data.name}</h1>
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
				{#if $productsQuery.data.price && $productsQuery.data.currency && !['sat', 'sats', 'btc'].includes($productsQuery.data.currency.toLowerCase())}
					<h3 class=" text-lg font-normal">
						{$productsQuery.data.price.toLocaleString('en-US', { style: 'currency', currency: $productsQuery.data.currency })}
						{$productsQuery.data.currency}
					</h3>
				{/if}
				<h3 class="my-8 font-bold">Stock: {$productsQuery.data.quantity}</h3>
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
						max={$productsQuery.data.quantity}
						readonly
					/>
					<Button
						class="border-2 border-black"
						size="icon"
						variant="outline"
						on:click={handleIncrement}
						disabled={qtyToCart >= $productsQuery.data.quantity}
					>
						<span class="i-mdi-plus w-4 h-4"></span>
					</Button>
					<Button
						class="ml-2"
						on:click={() => handleAddToCart(String($productsQuery.data?.userId), String($productsQuery.data?.stallId), $productsQuery.data)}
						>Add to cart</Button
					>
				</div>
				<span class="my-8 font-bold"
					>Sold by <a
						href={`/p/${$userProfileQuery?.data?.nip05 ? $userProfileQuery.data?.nip05 : $userProfileQuery?.data?.id ? $userProfileQuery.data?.id : user.id}`}
						><span class="underline"
							>{$userProfileQuery?.data?.name ? $userProfileQuery.data?.name : $userProfileQuery?.data?.displayName}<span /></span
						></a
					>
				</span>
				{#if $productsQuery.data.description}
					<article>
						<h4 class="text-2xl font-bold">Details</h4>
						<p>
							{truncateText($productsQuery.data.description)}
						</p>
					</article>
				{/if}
				{#if $productsQuery.data.categories}
					<article>
						<h4 class="font-bold">Categories</h4>
						<div class=" inline-flex gap-2">
							{#each $productsQuery.data.categories as category}
								<Badge variant="secondary" class=" w-fit">{category}</Badge>
							{/each}
						</div>
					</article>
				{/if}
			</div>
		</div>
	</div>
	{#if $productsQuery.data.description}
		<div class="container bg-gray-50 flex flex-col items-center p-10">
			<Tabs.Root class="w-[45%]">
				<Tabs.List class="w-full justify-around bg-transparent">
					<Tabs.Trigger value="description" class={activeTab}>Description</Tabs.Trigger>
					<Tabs.Trigger disabled value="comments" class={activeTab}>Comments</Tabs.Trigger>
					<Tabs.Trigger disabled value="reviews" class={activeTab}>Reviews</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="description" class="flex flex-col gap-2">
					<p>{$productsQuery.data.description}</p>
				</Tabs.Content>
				<Tabs.Content value="comments" class="flex flex-col gap-2"></Tabs.Content>
				<Tabs.Content value="reviews" class="flex flex-col gap-2"></Tabs.Content>
			</Tabs.Root>
		</div>
	{/if}

	{#if $otherProducts?.data?.products.length}
		<div class="container py-12">
			<h2>More from {$userProfileQuery?.data?.name}</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
				{#each $otherProducts?.data?.products as item}
					<ProductItem product={item} />
				{/each}
			</div>
		</div>
	{/if}
{/if}
