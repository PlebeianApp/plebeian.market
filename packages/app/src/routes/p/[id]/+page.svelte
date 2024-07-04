<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import Pattern from '$lib/components/Pattern.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { userFromNostr, userFromNostrMutation } from '$lib/fetch/users.mutations'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { normalizeStallData } from '$lib/nostrSubs/subs'
	import { fetchUserData, fetchUserProductData, fetchUserStallsData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard, getElapsedTimeInDays } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'

	import type { PageData } from './$types'
	import { productEventSchema } from '../../../schema/nostr-events'

	let userProfile: NDKUserProfile | null
	let stalls: Partial<RichStall>[] | null
	let toDisplayProducts: Partial<DisplayProduct>[]

	export let data: PageData
	const { id, exist } = data

	let isMe = false

	$: stallsQuery = exist
		? createStallsByFilterQuery({
				userId: id as string,
			})
		: undefined

	$: productsQuery = exist
		? createProductsByFilterQuery({
				userId: id as string,
			})
		: undefined

	$: userProfileQuery = exist ? createUserByIdQuery(id as string) : undefined

	$: {
		if (exist) {
			if ($userProfileQuery?.data) userProfile = $userProfileQuery?.data
			if ($stallsQuery?.data) stalls = $stallsQuery.data
			if ($productsQuery?.data) toDisplayProducts = $productsQuery?.data
		}
	}

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMe = $ndkStore.activeUser.pubkey === (id as string)
		}
	}

	async function setNostrData(
		stallData: Set<NDKEvent> | null,
		userData: NDKUserProfile | null,
		productsData: Set<NDKEvent> | null,
		allowRegister: boolean = false,
	): Promise<{ userInserted: boolean; stallInserted: boolean; productsInserted: boolean } | undefined> {
		let userInserted: boolean = false
		let stallInserted: boolean = false
		let productsInserted: boolean = false
		try {
			if (userData) {
				userData && (userData.id = id)
				if (allowRegister) {
					const userMutation = await $userFromNostr.mutateAsync({ profile: userData, pubkey: id as string })
					userMutation && (userInserted = true)
				}
				userProfile = userData
			}

			if (stallData) {
				const normalizedStallData = [...stallData].map(normalizeStallData).filter((stall): stall is Partial<RichStall> => stall !== null)
				if (stalls?.length) {
					const newStalls = normalizedStallData.filter((stall) => !stalls?.some((existingStall) => stall.id === existingStall.id))
					stalls = [...stalls, ...newStalls]
				} else {
					stalls = normalizedStallData
				}
			}

			if (productsData?.size) {
				toDisplayProducts = [...productsData].map((event) => {
					const product = productEventSchema.parse(JSON.parse(event.content))
					return {
						...product,
						images: product.images?.map((image) => ({
							createdAt: new Date(),
							productId: product.id,
							auctionId: null,
							imageUrl: image,
							imageType: 'gallery',
							imageOrder: 0,
						})),
					}
				})
				return { userInserted, stallInserted, productsInserted }
			}
		} catch (e) {
			console.error(e)
			return undefined
		}
	}

	onMount(async () => {
		if (!exist) {
			const { stallNostrRes } = await fetchUserStallsData(id)
			const { userProfile } = await fetchUserData(id)
			const { products } = await fetchUserProductData(id)
			await setNostrData(stallNostrRes, userProfile, products)
		} else {
			const { stallNostrRes } = await fetchUserStallsData(id)
			await setNostrData(stallNostrRes, null, null)
			if (userProfileQuery) {
				const userProfileUpdatedAt = get(userProfileQuery).data?.updated_at
				const elapsedTime = getElapsedTimeInDays(userProfileUpdatedAt as number)
				if (elapsedTime > 5 && userProfile) {
					const { userProfile } = await fetchUserData(id)
					await $userFromNostrMutation.mutateAsync({ profile: userProfile, pubkey: id as string })
					console.log('User profile updated from nostr')
				}
			}
		}
	})
</script>

{#if userProfile}
	{@const { image, name } = userProfile}
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="relative flex w-full flex-col items-center bg-black py-20 text-center text-white">
					<Pattern />
					<div class="w-fit z-10 justify-center">
						<div class="flex justify-center">
							<Avatar class="h-20 w-20">
								<AvatarImage src={image} alt="@shadcn" />
								<AvatarFallback>{name}</AvatarFallback>
							</Avatar>
						</div>
						<h2>{name}</h2>
						<div class="flex items-center">
							<Button variant="secondary" class="w-1/2 lg:w-auto">
								<code class="truncate">{npubEncode(id)}</code>
							</Button>
							<Button on:click={() => copyToClipboard(npubEncode(id))}>Copy</Button>
							{#if isMe}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger><Button>Create...</Button></DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											<DropdownMenu.Item on:click={openDrawerForNewStall}>Create stall</DropdownMenu.Item>
											<DropdownMenu.Item on:click={openDrawerForNewProduct}>Create product</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{/if}
						</div>
					</div>
				</div>
				{#if stalls}
					<div class="px-4 py-20 lg:px-12">
						<div class="container">
							<h2>Stalls</h2>
							<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
								{#each stalls as item}
									<StallItem stall={item} />
								{/each}
							</div>
						</div>
					</div>
				{/if}

				{#if toDisplayProducts}
					<div class="px-4 py-20 lg:px-12">
						<div class="container">
							<h2>Products</h2>
							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
								{#each toDisplayProducts as item}
									<ProductItem product={item} />
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</main>
		</div>
	</div>
{/if}
