<script lang="ts">
	import type { CarouselAPI } from '$lib/components/ui/carousel/context'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Carousel from '$lib/components/ui/carousel'
	import Input from '$lib/components/ui/input/input.svelte'
	import { activeTab } from '$lib/components/ui/tabs/constants'
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

	const cactiveTab = cn(activeTab, 'h-10 w-fit bg-light-gray px-4 py-2 text-off-black')

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
			class="absolute inset-x-0 -bottom-30 h-full bg-[radial-gradient(ellipse_at_bottom,var(--secondary)_25%,transparent_70%)] opacity-30 blur-2xl z-0"
		/>
		<Pattern />

		<div class="container relative z-1 min-h-[600px] py-8 px-4 sm:px-8">
			<div class="flex flex-col md:flex-row gap-8">
				<div class="flex-1 md:w-1/2">
					<div class="h-full">
						<div class="flex flex-col-reverse md:flex-row gap-4 h-full max-h-[36em]">
							{#key $productsQuery.data.identifier}
								{#if $productsQuery.data?.images?.length}
									{@const sortedImages = $productsQuery.data.images?.sort((a, b) => a.imageOrder - b.imageOrder)}
									<div class="flex flex-row md:flex-col gap-2 md:max-h-[500px] overflow-y-auto p-1">
										{#each sortedImages as item, i}
											<button
												class={cn(
													'relative shrink-0 md:w-16 w-12 p-1 transition-all',
													i === current - 1 ? 'ring-2 ring-secondary' : 'hover:ring-1 hover:ring-secondary/50',
												)}
												on:click={() => api?.scrollTo(i)}
											>
												<div class="aspect-square w-full overflow-hidden">
													<img class="h-full w-full object-cover" src={item.imageUrl} alt="" />
												</div>
												{#if i === current - 1}
													<div class="absolute bottom-1 right-1 w-2 h-2 bg-primary rounded-full" />
												{/if}
											</button>
										{/each}
									</div>
									<div class="flex-1 md:max-w-[calc(100%-5rem)] h-full">
										<Carousel.Root bind:api class="h-full">
											<Carousel.Content class="h-full">
												{#each sortedImages as item}
													<Carousel.Item class="h-full">
														<div class="w-full h-full rounded-lg">
															<img src={item.imageUrl} alt="" class="h-full w-full object-contain" loading="lazy" />
														</div>
													</Carousel.Item>
												{/each}
											</Carousel.Content>
										</Carousel.Root>
									</div>
								{:else}
									<div class="w-full aspect-square flex items-center justify-center rounded-lg">
										<span
											style={`color:${stringToHexColor(String($productsQuery.data.name || $productsQuery.data.identifier))}`}
											class="i-mdi-package-variant-closed w-16 h-16"
										/>
									</div>
								{/if}
							{/key}
						</div>
					</div>
				</div>

				<div class="flex flex-col flex-1 md:w-1/2 text-white">
					{#if isMyProduct}
						<Button variant="primary" class="w-1/4" on:click={() => openDrawerForProduct(data.productRes.id)}>Edit product</Button>
					{/if}
					<h3 class="md:mb-12 mb-6 break-words overflow-hidden">{$productsQuery.data.name}</h3>

					<div class="flex md:flex-col flex-row gap-2 w-full">
						<div class="flex flex-col gap-2 w-full">
							<h3 class="inline-flex items-center">
								{#if $priceQuery?.isLoading}
									<Spinner />
								{:else if typeof $priceQuery?.data === 'number' && !Number.isNaN($priceQuery.data)}
									{formatSats($priceQuery.data)}
									sats
								{:else}
									<i class="text-lg break-words"
										>price ({$productsQuery.data?.price} {$productsQuery.data?.currency}) could not be converted</i
									>
								{/if}
							</h3>
							{#if $productsQuery.data.price && $productsQuery.data.currency && !['sat', 'sats', 'btc'].includes($productsQuery.data.currency.toLowerCase())}
								<h4 class="font-thin">
									{$productsQuery.data.price.toLocaleString('en-US', { style: 'currency', currency: $productsQuery.data.currency })}
									{$productsQuery.data.currency}
								</h4>
							{/if}
						</div>
						<Badge variant="secondary" class="w-36 md:w-fit md:my-12 my-6">
							Stock: {$productsQuery.data.quantity}
						</Badge>
					</div>

					<div class="flex sm:w-1/2 w-full flex-row gap-1">
						<div class=" flex flex-row gap-1">
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
						</div>
						{#if $productsQuery.data.quantity && $productsQuery.data.quantity > 0}
							<Button
								class="ml-2"
								variant="secondary"
								on:click={() => handleAddToCart(String($productsQuery.data?.userId), String(stallCoordinates), $productsQuery.data)}
								>Add to cart</Button
							>
						{:else}
							<Button variant="tertiary" disabled>Out of stock</Button>
						{/if}
						<AdminActions type="product" id={data.productRes.id} isFeatured={$productsQuery.data.isFeatured} />
					</div>

					<span class="my-8 font-bold">
						Sold by
						<a
							href={`/p/${$userProfileQuery?.data?.nip05 ? $userProfileQuery.data?.nip05 : $userProfileQuery?.data?.id ? $userProfileQuery.data?.id : data.user.id}`}
							><span class="underline"
								>{$userProfileQuery?.data?.name ? $userProfileQuery.data?.name : $userProfileQuery?.data?.displayName}<span /></span
							></a
						>
					</span>

					{#if $productsQuery.data.description}
						<article class="my-4 overflow-hidden">
							<h4 class="sm:text-2xl text-xl font-bold">Details</h4>
							<p class="break-words whitespace-pre-wrap">
								{truncateText($productsQuery.data.description)}
							</p>
						</article>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if $productsQuery.data.description}
		{#if $breakpoint !== 'lg'}
			<div class="flex flex-col gap-8 -mt-8">
				<div class="mx-8 shadow-md z-10">
					<div class="container flex flex-col items-center p-2 bg-neo-purple">
						<h4 class="text-white font-bold">Description</h4>
					</div>
					<div class="container flex flex-col items-center p-8 bg-white">
						{#if $productsQuery.data.description.length > 420}
							{#if !isExpanded}
								<p class="whitespace-pre-wrap break-words w-full" transition:slide>
									{$productsQuery.data.description.slice(0, 420)}...
								</p>
							{:else}
								<p class="whitespace-pre-wrap break-words w-full" transition:slide>
									{$productsQuery.data.description}
								</p>
							{/if}
							<Button
								variant="ghost"
								class="self-end mt-4"
								on:click={() => {
									isExpanded = !isExpanded
								}}
							>
								{isExpanded ? 'Show Less' : 'Read More...'}
							</Button>
						{:else}
							<p class="whitespace-pre-wrap break-words w-full">
								{$productsQuery.data.description}
							</p>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<div class="container -mt-12 flex flex-col items-center z-30 p-8">
				<Tabs.Root class="w-full">
					<Tabs.List class="w-full flex flex-row gap-3 bg-transparent justify-start relative">
						<Tabs.Trigger value="description" class={cactiveTab}>Description</Tabs.Trigger>
						<Tabs.Trigger value="comments" disabled class={cactiveTab}>Comments</Tabs.Trigger>
						<Tabs.Trigger value="reviews" disabled class={cactiveTab}>Reviews</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="description" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10">
						{#if $productsQuery.data.description.length > 420}
							{#if !isExpanded}
								<p class="whitespace-pre-wrap break-words w-full" transition:slide>
									{$productsQuery.data.description.slice(0, 420)}...
								</p>
							{:else}
								<p class="whitespace-pre-wrap break-words w-full" transition:slide>
									{$productsQuery.data.description}
								</p>
							{/if}
							<Button
								variant="ghost"
								class="self-end mt-4"
								on:click={() => {
									isExpanded = !isExpanded
								}}
							>
								{isExpanded ? 'Show Less' : 'Read More...'}
							</Button>
						{:else}
							<p class="whitespace-pre-wrap break-words w-full">
								{$productsQuery.data.description}
							</p>
						{/if}
					</Tabs.Content>
					<Tabs.Content value="comments" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10"
					></Tabs.Content>
					<Tabs.Content value="reviews" class="flex flex-col gap-2 bg-white border-t-2 border-black shadow-md rounded-md p-10"
					></Tabs.Content>
				</Tabs.Root>
			</div>
		{/if}
	{/if}
	<div class="mx-4">
		{#if $otherProducts?.data?.products.length}
			<ItemGrid title="More from {$userProfileQuery?.data?.name}">
				{#key $otherProducts.data.products}
					{#each $otherProducts?.data?.products as item}
						<ProductItem product={item} />
					{/each}
				{/key}
			</ItemGrid>
		{/if}
	</div>
{/if}
