<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context'
	import autoAnimate from '@formkit/auto-animate'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Carousel from '$lib/components/ui/carousel'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import Input from '$lib/components/ui/input/input.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { KindStalls } from '$lib/constants'
	import { createCurrencyConversionQuery, createProductQuery, createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { handleAddToCart } from '$lib/stores/cart'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import { cn, formatSats, parseCoordinatesString, stringToHexColor, truncateText } from '$lib/utils'
	import { slide } from 'svelte/transition'

	import type { PageData } from './$types'

	let api: CarouselAPI
	let count = 0
	let current = 0

	export let data: PageData
	let isMyProduct = false
	let qtyToCart = 1
	let isExpanded = false

	const activeTab =
		'h-10 px-4 py-2 bg-light-gray text-off-black data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=disabled]:bg-light-gray data-[state=disabled]:text-off-black data-[state=disabled]:border-light-gray data-[state=disabled]:opacity-100 disabled:opacity-100'

	$: productsQuery = createProductQuery(data.productRes.id)

	$: if ($productsQuery.data) {
		qtyToCart = $productsQuery.data.quantity > 0 ? 1 : 0
	}

	$: userProfileQuery = data.user.id ? createUserByIdQuery(data.user.id) : undefined
	$: stallCoordinates = parseCoordinatesString(`${KindStalls}:${data.user.id}:${$productsQuery.data?.stall_id}`).coordinates
	$: priceQuery = createCurrencyConversionQuery($productsQuery.data?.currency as string, $productsQuery.data?.price as number)

	$: otherProducts = data.user.id ? createProductsByFilterQuery({ userId: data.user.id, pageSize: 3 }) : undefined

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

{#if $productsQuery.data && data.user.id}
	<div class="relative bg-black">
		<div
			class="absolute inset-x-0 -bottom-18 h-full bg-[radial-gradient(ellipse_at_bottom,var(--secondary)_25%,transparent_70%)] opacity-30 blur-2xl z-0"
		></div>

		<Pattern />

		<div class="container flex flex-row text-white h-[50vh] gap-6 pt-8 pl-8 pr-8 relative z-1 pb-24">
			<div class="flex flex-row gap-8 w-1/2">
				{#key $productsQuery.data.identifier}
					{#if $productsQuery.data?.images?.length}
						{@const sortedImages = $productsQuery.data.images?.sort((a, b) => a.imageOrder - b.imageOrder)}
						<div class="flex flex-col gap-2">
							{#each sortedImages as item, i}
								<button
									class={cn(
										'w-24 object-cover aspect-square cursor-pointer p-1 relative',
										i === current - 1 ? 'border border-secondary' : null,
									)}
									on:click={() => {
										api?.scrollTo(i)
									}}
								>
									<img class="aspect-square object-cover" src={item.imageUrl} alt="" />
									{#if i === current - 1}
										<div class="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
									{/if}
								</button>
							{/each}
						</div>
						<Carousel.Root bind:api>
							<Carousel.Content class="max-h-full">
								{#each sortedImages as item}
									<Carousel.Item class="flex items-center justify-center h-full aspect-square">
										<div class="flex items-center justify-center h-full aspect-square">
											<img class="object-contain h-full" src={item.imageUrl} alt="" />
										</div>
									</Carousel.Item>
								{/each}
							</Carousel.Content>
						</Carousel.Root>
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
			<div class="flex flex-col gap-1 w-1/2">
				{#if isMyProduct}
					<Button variant="primary" class="w-1/4" on:click={() => openDrawerForProduct(data.productRes.id)}>Edit product</Button>
				{/if}
				<h3 class="mb-4">{$productsQuery.data.name}</h3>
				<h3 class="inline-flex items-center">
					{#if $priceQuery?.isLoading}
						<Spinner />
					{:else if typeof $priceQuery?.data === 'number' && !Number.isNaN($priceQuery.data)}
						{formatSats($priceQuery.data)}
						sats
					{:else}
						<i class="text-lg">price ({$productsQuery.data?.price} {$productsQuery.data?.currency}) could not be converted</i>
					{/if}
				</h3>
				{#if $productsQuery.data.price && $productsQuery.data.currency && !['sat', 'sats', 'btc'].includes($productsQuery.data.currency.toLowerCase())}
					<h4 class="font-thin">
						{$productsQuery.data.price.toLocaleString('en-US', { style: 'currency', currency: $productsQuery.data.currency })}
						{$productsQuery.data.currency}
					</h4>
				{/if}

				<Badge variant="secondary" class="w-fit my-4">
					Stock: {$productsQuery.data.quantity}
				</Badge>

				<div class="flex sm:w-1/2 w-full flex-row gap-1">
					<Button variant="tertiary" size="icon" on:click={handleDecrement} disabled={qtyToCart <= 1}>
						<span class="i-mdi-minus w-4 h-4"></span>
					</Button>
					<Input
						class="text-off-black rounded-md w-10"
						value={qtyToCart}
						on:input={(e) => (qtyToCart = parseInt(e.target.value))}
						min="1"
						max={$productsQuery.data.quantity}
						readonly
					/>
					<Button size="icon" variant="tertiary" on:click={handleIncrement} disabled={qtyToCart >= $productsQuery.data.quantity}>
						<span class="i-mdi-plus w-4 h-4"></span>
					</Button>

					{#if $productsQuery.data.quantity && $productsQuery.data.quantity > 0}
						<Button
							class="ml-2"
							variant="secondary"
							on:click={() => handleAddToCart(String($productsQuery.data?.userId), String(stallCoordinates), $productsQuery.data)}
							>{$breakpoint !== 'lg' ? 'Add' : 'Add to cart'}</Button
						>
					{:else}
						<Button variant="tertiary" disabled>Out of stock</Button>
					{/if}
					<AdminActions type="product" id={data.productRes.id} isFeatured={$productsQuery.data.isFeatured} />
				</div>
				<span class="my-8 font-bold"
					>Sold by <a
						href={`/p/${$userProfileQuery?.data?.nip05 ? $userProfileQuery.data?.nip05 : $userProfileQuery?.data?.id ? $userProfileQuery.data?.id : data.user.id}`}
						><span class="underline"
							>{$userProfileQuery?.data?.name ? $userProfileQuery.data?.name : $userProfileQuery?.data?.displayName}<span /></span
						></a
					>
				</span>
				{#if $productsQuery.data.description}
					<article class="my-4">
						<h4 class="sm:text-2xl text-xl font-bold">Details</h4>
						<p>
							{truncateText($productsQuery.data.description)}
						</p>
					</article>
				{/if}
			</div>
		</div>
	</div>

	<Pattern pattern="page" class=" opacity-40 -z-10 " />

	{#if $productsQuery.data.description}
		<div class="container -mt-12 flex flex-col items-center z-30 p-8">
			<Tabs.Root class="w-full">
				<Tabs.List class="w-full flex flex-row gap-3 bg-transparent justify-start relative">
					<Tabs.Trigger value="description" class={activeTab}>Description</Tabs.Trigger>
					<Tabs.Trigger value="comments" disabled class={activeTab}>Comments</Tabs.Trigger>
					<Tabs.Trigger value="reviews" disabled class={activeTab}>Reviews</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="description" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10">
					{#if $productsQuery.data.description.length > 420}
						{#if !isExpanded}
							<p transition:slide>{$productsQuery.data.description.slice(0, 420)}...</p>
						{:else}
							<p transition:slide>{$productsQuery.data.description}</p>
						{/if}
						<Button
							variant="ghost"
							class="self-end"
							on:click={() => {
								isExpanded = !isExpanded
							}}
						>
							{isExpanded ? 'Show Less' : 'Read More...'}
						</Button>
					{:else}
						<p>{$productsQuery.data.description}</p>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="comments" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10"
				></Tabs.Content>
				<Tabs.Content value="reviews" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10"></Tabs.Content>
			</Tabs.Root>
		</div>
	{/if}

	{#if $otherProducts?.data?.products.length}
		<ItemGrid title="More from {$userProfileQuery?.data?.name}">
			{#key $otherProducts.data.products}
				{#each $otherProducts?.data?.products as item}
					<ProductItem product={item} />
				{/each}
			{/key}
		</ItemGrid>
	{/if}
{/if}
