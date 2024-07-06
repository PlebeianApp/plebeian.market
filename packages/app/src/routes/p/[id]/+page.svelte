<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import Pattern from '$lib/components/Pattern.svelte'
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
	import { copyToClipboard, getElapsedTimeInDays } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'

	import type { PageData } from './$types'

	let userProfile: NDKUserProfile | null
	let stalls: Partial<RichStall>[] | null
	let toDisplayProducts: Partial<DisplayProduct>[]

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
			const normalizedStallData = [...stallNostrRes].map(normalizeStallData).filter((stall): stall is Partial<RichStall> => stall !== null)
			if (stalls?.length) {
				const newStalls = normalizedStallData.filter((stall) => !stalls?.some((existingStall) => stall.id === existingStall.id))
				stalls = [...stalls, ...newStalls]
			} else {
				stalls = normalizedStallData
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
