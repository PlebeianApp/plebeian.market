<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import StallItem from '$lib/components/stalls/stall-item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import {
		fetchUserData,
		fetchUserProductData,
		fetchUserStallsData,
		handleUserNostrData,
		mergeProducts,
		normalizeStallData,
		setNostrData,
	} from '$lib/nostrSubs/utils'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getElapsedTimeInDays, truncateText } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const {
		id,
		exist,
		appSettings: { allowRegister },
	} = data

	let userProfile: NDKUserProfile | null = null
	let nostrStalls: Partial<RichStall>[] = []
	let toDisplayProducts: Partial<DisplayProduct>[] = []
	let following = false
	let showFullAbout = false
	$: isMe = $ndkStore.activeUser?.pubkey === id

	$: stallsQuery = exist ? createStallsByFilterQuery({ userId: id }) : undefined
	$: productsQuery = exist ? createProductsByFilterQuery({ userId: id }) : undefined
	$: userProfileQuery = exist ? createUserByIdQuery(id) : undefined

	$: stallsMixture = [...($stallsQuery?.data ?? []), ...nostrStalls]

	$: {
		if (exist && $userProfileQuery?.data) userProfile = $userProfileQuery.data
		if (exist && $productsQuery?.data) toDisplayProducts = $productsQuery.data
	}

	onMount(async () => {
		if (!id) return

		const fetchAndProcessData = async () => {
			const { stallNostrRes } = await fetchUserStallsData(id)
			if (stallNostrRes) {
				nostrStalls = (await Promise.all([...stallNostrRes].map(normalizeStallData)))
					.filter(({ data: stall }) => !$stallsQuery?.data?.some((existingStall) => stall?.id === existingStall.id))
					.map(({ data }) => data as Partial<RichStall>)
					.filter(Boolean)
			}

			if (!exist) {
				const { userProfile: userData } = await fetchUserData(id)
				if (userData) userProfile = userData
				// FIXME products from stalls with forbidden words are beign displayed
				const { products: productsData } = await fetchUserProductData(id)
				if (productsData?.size) {
					toDisplayProducts = await mergeProducts(toDisplayProducts, productsData, id)
				}

				await setNostrData(null, userProfile, null, allowRegister, id, exist)
			} else {
				const userProfileUpdatedAt = $userProfileQuery?.data?.updated_at
				const elapsedTime = getElapsedTimeInDays(userProfileUpdatedAt as number)
				if (elapsedTime > 5 && userProfile) {
					const { userProfile: newUserProfile } = await fetchUserData(id)
					if (newUserProfile) {
						await handleUserNostrData(newUserProfile, id)
						console.log('User profile updated from nostr')
					}
				}

				const { products: productsData } = await fetchUserProductData(id)
				if (productsData?.size) {
					toDisplayProducts = await mergeProducts(toDisplayProducts, productsData, id)
				}
			}
		}

		fetchAndProcessData()
	})

	const handleFollow = () => {
		const user = $ndkStore.getUser({ pubkey: id })
		// await user.follow();
		following = true
	}

	const handleUnfollow = () => {
		const user = $ndkStore.getUser({ pubkey: id })
		// await user.unfollow();
		following = false
	}

	const handleZap = () => {
		const user = $ndkStore.getUser({ pubkey: id })
		// await user.zap();
	}

	const handleSendMessage = () => {
		const user = $ndkStore.getUser({ pubkey: id })
		// await user.sendMessage();
	}
</script>

{#if userProfile}
	{@const { image, name, about, banner } = userProfile}
	<div class="px-4 lg:px-12">
		<div class="flex flex-col gap-14">
			<div class="relative h-auto">
				{#if banner}
					<img src={banner} alt="profile" class="border-black border-2 object-cover w-full h-[25vh]" />
				{:else}
					<div style={`background-color: #${id?.substring(0, 6)}`} class="h-[10vh] border-2 border-black"></div>
				{/if}

				<div class="grid lg:grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 mt-8 justify-between">
					<div class="px-2">
						<Avatar class="border-black border-2 h-24 w-24">
							<AvatarImage src={image} alt="pfp" />
							<AvatarFallback style={`background-color: #${id?.substring(0, 6)}`}>
								<span class="i-tdesign-user-1 w-8 h-8" />
							</AvatarFallback>
						</Avatar>
					</div>
					<div class="flex flex-col">
						<h1 class="text-3xl">{name ?? `Unnamed user`}</h1>
						{#if about}
							{@const truncatedAbout = truncateText(about)}
							{#if truncatedAbout !== about}
								<p class="break-words">{showFullAbout ? about : truncatedAbout}</p>
								<Button variant="outline" size="icon" on:click={() => (showFullAbout = !showFullAbout)}>
									<span class={showFullAbout ? 'i-mdi-minus' : 'i-mdi-plus'} />
								</Button>
							{:else}
								<p class="break-words">{about}</p>
							{/if}
						{/if}
					</div>
					<div class="flex flex-col">
						<div class="flex flex-row gap-2">
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
							<Button size="icon" variant="secondary" on:click={handleZap}>
								<span class="i-mdi-dots-horizontal w-6 h-6" />
							</Button>
							<Button size="icon" variant="secondary" on:click={handleZap}>
								<span class="i-mingcute-lightning-line w-6 h-6" />
							</Button>
							<Button size="icon" variant="secondary" on:click={handleSendMessage}>
								<span class="i-mdi-message-bubble w-6 h-6" />
							</Button>
							<Button class="w-1/2 lg:w-auto" on:click={following ? handleUnfollow : handleFollow}>
								{following ? 'Unfollow' : 'Follow'}
							</Button>
						</div>
					</div>
				</div>
			</div>
			{#if stallsMixture.length}
				<div class="container">
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						{#each stallsMixture as item (item.id)}
							<StallItem stallData={item} />
						{/each}
					</div>
				</div>
			{/if}

			{#if toDisplayProducts.length}
				<div class="container">
					<h2>Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each toDisplayProducts as item (item.id)}
							<ProductItem product={item} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
