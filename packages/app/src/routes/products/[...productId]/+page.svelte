<script lang="ts">
	import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import { beforeNavigate } from '$app/navigation'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import ImgPlaceHolder from '$lib/components/product/imgPlaceHolder.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import { KindStalls } from '$lib/constants'
	import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
	import { createProductPriceQuery, createProductQuery, createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { stallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import { userFromNostr } from '$lib/fetch/users.mutations'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { fetchProductData, fetchStallData, fetchUserData } from '$lib/nostrSubs/utils'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import { cn } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { ProductImagesType } from '@plebeian/database'

	import type { PageData } from './$types'
	import { productEventSchema } from '../../../schema/nostr-events'

	export let data: PageData
	const { user, productRes } = data
	let isMyProduct = false
	let toDisplayProduct: Partial<DisplayProduct>
	let userProfile: NDKUserProfile | null
	let userProducts: DisplayProduct[]

	$: productsQuery = productRes.exist ? createProductQuery(productRes.id) : undefined

	$: userProfileQuery = user.exist ? createUserByIdQuery(user.id as string) : undefined

	$: priceQuery = toDisplayProduct ? createProductPriceQuery(toDisplayProduct as DisplayProduct) : undefined

	$: otherProducts = user.exist ? createProductsByFilterQuery({ userId: user.id }) : undefined

	$: {
		if ($productsQuery?.data) {
			toDisplayProduct = $productsQuery?.data
		}
		if ($userProfileQuery?.data) {
			userProfile = $userProfileQuery?.data
		}
		if ($otherProducts?.data) {
			userProducts = $otherProducts.data
		}
	}

	let selectedImage = 0

	async function setNostrData(
		stallData: NDKEvent | null,
		userData: NDKUserProfile | null,
		productsData: NDKEvent | null,
	): Promise<{ userInserted: boolean; stallInserted: boolean; productsInserted: boolean } | undefined> {
		let userInserted: boolean = false
		let stallInserted: boolean = false
		let productsInserted: boolean = false
		try {
			if (userData) {
				userData && (userData.id = user.id)
				const userMutation = await $userFromNostr.mutateAsync({ profile: userData, pubkey: user.id as string })
				userMutation && (userInserted = true)
			}

			if (stallData) {
				const stallEvent = await stallData.toNostrEvent()
				const stallMutation = await $stallFromNostrEvent.mutateAsync(stallEvent)
				stallMutation && (stallInserted = true)
			}

			if (productsData) {
				const parsedProduct = productEventSchema.parse(JSON.parse(productsData.content))
				toDisplayProduct = {
					...parsedProduct,
					quantity: parsedProduct.quantity as number,
					images: parsedProduct.images?.map((image) => ({
						createdAt: new Date(),
						productId: productRes.id,
						auctionId: null,
						imageUrl: image,
						imageType: 'gallery' as ProductImagesType,
						imageOrder: 0,
					})),
					userId: user.id,
				}
				const productsMutation = await $createProductsFromNostrMutation.mutateAsync(new Set<NDKEvent>([productsData]))
				productsMutation && (productsInserted = true)
			}
			return { userInserted, stallInserted, productsInserted }
		} catch (e) {
			console.error(e)
			return undefined
		}
	}

	onMount(async () => {
		if (!productRes.exist && productRes.id) {
			const { userProfile } = await fetchUserData(user.id as string)
			const { nostrProduct } = await fetchProductData(productRes.id as string)
			const productStallId = JSON.parse(nostrProduct?.content as string).stall_id
			const { stallNostrRes } = await fetchStallData(`${KindStalls}:${user.id}:${productStallId}`)

			await setNostrData(stallNostrRes, userProfile, nostrProduct)
		}
	})
	beforeNavigate(() => {
		toDisplayProduct.images = []
	})
</script>

{#if toDisplayProduct}
	<div class="container py-16">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="grid grid-cols-3 gap-6">
				{#if toDisplayProduct?.images?.length}
					{@const sortedImages = toDisplayProduct.images.slice().sort((a, b) => a.imageOrder - b.imageOrder)}
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
				<h1>{toDisplayProduct.name}</h1>
				<h2 class=" inline-flex items-center">
					{#if $priceQuery?.isLoading}
						<Spinner />
					{:else if $priceQuery?.data}
						{$priceQuery.data}
					{/if}
					sats
				</h2>
				<h3>${toDisplayProduct.price} {toDisplayProduct.currency}</h3>

				<h3 class="my-8 font-bold">Stock: {toDisplayProduct.quantity}</h3>
				<div class="flex w-1/2 flex-row gap-4">
					<Input class="border-2 border-black" type="number" value="1" min="1" max="5" />
					<Button>Add to cart</Button>
				</div>
				<span class="my-8 font-bold"
					>Sold by <a href={`/p/${userProfile?.nip05 ? userProfile.nip05 : userProfile?.id}`}
						><span class="underline">{userProfile?.name ? userProfile?.name : userProfile?.displayName}<span /></span></a
					>
				</span>
				<article>
					<h4 class="text-2xl font-bold">Details</h4>
					<p>
						{toDisplayProduct.description}
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
