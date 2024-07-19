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
		normalizeProductsFromNostr,
		normalizeStallData,
		setNostrData,
	} from '$lib/nostrSubs/utils'
	import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { getElapsedTimeInDays, stringToHexColor, truncateText } from '$lib/utils'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'

	import type { PageData } from './$types'

	let userProfile: NDKUserProfile | null
	let stalls: Partial<RichStall>[] | null
	let toDisplayProducts: Partial<DisplayProduct>[]
	let following = false
	let showFullAbout = false

	export let data: PageData
	const {
		id,
		exist,
		appSettings: { allowRegister },
	} = data

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

	onMount(async () => {
		const { stallNostrRes } = await fetchUserStallsData(id)

		if (stallNostrRes) {
			const normalizedStallData = [...stallNostrRes]
				.map(normalizeStallData)
				.filter((result) => result.data !== null)
				.map((result) => result.data)

			if (stalls?.length) {
				const newStalls = normalizedStallData.filter((stall) => !stalls?.some((existingStall) => stall?.id === existingStall.id))
				stalls = [...stalls, ...newStalls] as Partial<RichStall>[]
			} else {
				stalls = normalizedStallData as Partial<RichStall>[]
			}
		}

		if (!exist) {
			const { userProfile: userData } = await fetchUserData(id)
			userData && (userProfile = userData)

			const { products: productsData } = await fetchUserProductData(id)
			if (productsData) {
				const result = normalizeProductsFromNostr(productsData, id as string)
				if (result) {
					const { toDisplayProducts: _toDisplay } = result
					toDisplayProducts = _toDisplay
				}
			}

			await setNostrData(null, userProfile, null, allowRegister, id, exist)
		} else {
			if (userProfileQuery) {
				const userProfileUpdatedAt = get(userProfileQuery).data?.updated_at
				const elapsedTime = getElapsedTimeInDays(userProfileUpdatedAt as number)
				if (elapsedTime > 5 && userProfile) {
					const { userProfile } = await fetchUserData(id)
					if (!userProfile) return
					await handleUserNostrData(userProfile, id)
					console.log('User profile updated from nostr')
				}
			}
			const { products: productsData } = await fetchUserProductData(id)
			if (productsData) {
				const result = normalizeProductsFromNostr(productsData, id as string)
				if (result) {
					const { toDisplayProducts: _toDisplay } = result
					toDisplayProducts = _toDisplay
				}
			}
		}
	})

	const handleFollow = async () => {
		const user = $ndkStore.getUser({ pubkey: id as string })
		// await user.follow()
	}

	const handleUnfollow = async () => {
		const user = $ndkStore.getUser({ pubkey: id as string })
		// await user.unfollow()
	}

	const handleZap = async () => {
		const user = $ndkStore.getUser({ pubkey: id as string })
		// await user.zap()
	}

	const handleSendMessage = async () => {
		const user = $ndkStore.getUser({ pubkey: id as string })
		// await user.sendMessage()
	}

	const handleCreateStall = async () => {
		openDrawerForNewStall()
	}

	const handleCreateProduct = async () => {
		openDrawerForNewProduct()
	}
</script>

{#if userProfile}
	{@const { image, name, about, banner } = userProfile}
	<div class="px-4 lg:px-12">
		<div class="flex flex-col gap-14 py-5">
			<div class="relative h-auto">
				{#if banner}
					<img src={banner} alt="profile" class="border-black border-2 object-cover w-full h-[25vh]" />
				{:else}
					<div style={`background-color: ${stringToHexColor(String(name))}`} class=" h-[10vh] border-2 border-black"></div>
				{/if}

				<div class="grid lg:grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4 mt-8 justify-between">
					<div class=" px-2">
						<Avatar class="border-black border-2 h-24 w-24">
							<AvatarImage src={image} alt="pfp" />
							<AvatarFallback style={`background-color: ${stringToHexColor(String(name))}`}
								><span class="i-tdesign-user-1 w-8 h-8" /></AvatarFallback
							>
						</Avatar>
					</div>
					<div class="flex flex-col">
						<h1 class=" text-3xl">{name}</h1>
						{#if about}
							{@const _about = truncateText(about)}
							{#if _about !== about}
								<p class="break-words">{showFullAbout ? about : _about}</p>
								<Button variant="outline" size="icon" on:click={() => (showFullAbout = !showFullAbout)}>
									{#if !showFullAbout}
										<span class=" i-mdi-plus" />
									{:else}
										<span class=" i-mdi-minus" />
									{/if}
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
							{#if following}
								<Button class="w-1/2 lg:w-auto" on:click={handleUnfollow}>Unfollow</Button>
							{:else}
								<Button class="w-1/2 lg:w-auto" on:click={handleFollow}>Follow</Button>
							{/if}
						</div>
					</div>
				</div>
			</div>
			{#if stalls}
				<div class="container">
					<h2>Stalls</h2>
					<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
						{#each stalls as item}
							<StallItem stallData={item} />
						{/each}
					</div>
				</div>
			{/if}

			{#if toDisplayProducts}
				<div class="container">
					<h2>Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each toDisplayProducts as item}
							<ProductItem product={item} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
