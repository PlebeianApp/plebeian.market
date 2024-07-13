<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { beforeNavigate } from '$app/navigation'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ImgPlaceHolder from '$lib/components/product/imgPlaceHolder.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
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

	let selectedImage = 0

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
</script>

{#if toDisplayProducts}
	<div class="container py-16">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="grid grid-cols-3 gap-6">
				{#if toDisplayProducts[0]?.images?.length}
					{@const sortedImages = toDisplayProducts[0].images.slice().sort((a, b) => a.imageOrder - b.imageOrder)}
					<ul class="grid gap-4 md:col-span-1">
						{#each sortedImages as item, i}
							<button
								class={cn('cursor-pointer p-1', i === selectedImage ? 'border border-primary' : null)}
								on:click={() => (selectedImage = i)}
							>
								<img src={item.imageUrl} alt="" />
							</button>
						{/each}
					</ul>
					<img class="col-span-2 border-2 border-black p-1" src={sortedImages[selectedImage].imageUrl} alt="" />
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
					<Input
						on:change={(e) => (qtyToCart = parseInt(e.target.value))}
						class="border-2 border-black"
						type="number"
						value="1"
						min="1"
						max={toDisplayProducts[0].quantity}
					/>
					<Button
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
					<a href={`/cat/${cat.id}`}>
						<Badge>{cat.name}</Badge>
					</a>
				{/each} -->
				</article>
			</div>
		</div>
	</div>
	<div class="container">
		<hr />
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
