<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { User } from 'lucide-svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { Badge } from '$lib/components/ui/badge'
	import { KindProducts, KindStalls } from '$lib/constants'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { productsFilterSchema, stallsFilterSchema } from '$lib/schema'
	import ndkStore from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	import type { Stall } from '@plebeian/database'

	import type { PageData } from './$types'
	import { productEventSchema, stallEventSchema } from '../../../schema/nostr-events'

	export let data: PageData
	let { stall, user } = data
	let userProfile: Partial<User> | NDKUserProfile | null
	let stallResponse: Partial<RichStall>
	let products: Partial<DisplayProduct>[]

	onMount(async () => {
		if (!stall.exist) {
			const stallFilter = {
				kinds: [KindStalls],
				authors: [user.id],
				'#d': [stall.identifier],
			}
			const stallNostrRes = await $ndkStore.fetchEvent(stallFilter)

			stallResponse = JSON.parse(stallNostrRes?.content ?? '{}')

			const ndkUser = $ndkStore.getUser({
				pubkey: user.id,
			})
			const userProfileFromNostr = await ndkUser.fetchProfile()
			if (userProfileFromNostr) {
				console.log(userProfileFromNostr)
				userProfile = userProfileFromNostr
				stallResponse.userId = user.id
				stallResponse.userName = userProfileFromNostr.name || userProfileFromNostr.displayName
				stallResponse.userNip05 = userProfileFromNostr.nip05
			}

			const productsFilter = {
				kinds: [KindProducts],
				authors: [user.id],
			}
			const productsNostrRes = await $ndkStore.fetchEvents(productsFilter)
			const productContent = [...productsNostrRes].map((event) => productEventSchema.parse(JSON.parse(event.content)))
			products = productContent
		} else {
			createStallsByFilterQuery(stallsFilterSchema.parse({ stallId: stall.id })).subscribe((stallRes) => {
				if (stallRes.data) {
					stallResponse = stallRes.data[0]
				}
			})
			createProductsByFilterQuery(productsFilterSchema.parse({ stallId: stall.id })).subscribe((productsRes) => {
				if (productsRes.data) {
					products = productsRes.data
					console.log(products)
				}
			})
		}
	})
	$: console.log(userProfile?.image)
</script>

{#if stallResponse}
	<div class="flex min-h-screen w-full flex-col bg-muted/40">
		<div class="flex flex-col">
			<main class="text-black">
				<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
					<section class="w-fit">
						<a href={`/p/${stallResponse.userNip05 ? stallResponse.userNip05 : stallResponse.userId}`} class="flex flex-col items-center">
							<Avatar>
								<AvatarImage src={userProfile?.image} alt="@shadcn" />
								<AvatarFallback>{userProfile?.name?.substring(0, 2)}</AvatarFallback>
							</Avatar>
							<span>{stallResponse.userName}</span>
						</a>
					</section>
					<h1>{stallResponse.name}</h1>
					<p class="text-2xl">{stallResponse.description}</p>

					<Accordion.Root class="w-full sm:max-w-sm">
						<Accordion.Item value="item-1">
							<Accordion.Trigger>More info</Accordion.Trigger>
							<Accordion.Content>
								<div class=" flex flex-col gap-2 items-start">
									<span>Shipping zones</span>
									<!-- <section class=" flex gap-2 flex-wrap">
									{#each zones as zone}
										<Badge variant="secondary">{zone.region}</Badge>
									{/each}
								</section> -->
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2>Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#if products}
								{#each products as item}
									<ProductItem product={item} />
								{/each}
							{/if}
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
{:else}
	wops
{/if}
