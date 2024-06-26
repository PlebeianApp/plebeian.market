<script lang="ts">
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { Badge } from '$lib/components/ui/badge'
	import { Button } from '$lib/components/ui/button'
	import { openDrawerForProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ stall, user, zones } = data)

	let isMyStall = false

	$: {
		const userId = $ndkStore.activeUser?.pubkey
		isMyStall = userId === stall.userId
	}
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<section class="w-fit">
					<a href={`/p/${user.nip05 ? user.nip05 : user.id}`} class="flex flex-col items-center">
						<Avatar>
							<AvatarImage src={user.image} alt="@shadcn" />
							<AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
						</Avatar>
						<span>{user.name}</span>
					</a>
				</section>
				<h1>{stall.name}</h1>
				<p class="text-2xl">{stall.description}</p>

				<Accordion.Root class="w-full sm:max-w-sm">
					<Accordion.Item value="item-1">
						<Accordion.Trigger>More info</Accordion.Trigger>
						<Accordion.Content>
							<div class=" flex flex-col gap-2 items-start">
								<span>Shipping zones</span>
								<section class=" flex gap-2 flex-wrap">
									{#each zones as zone}
										<Badge variant="secondary">{zone.region}</Badge>
									{/each}
								</section>
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>

				{#if isMyStall}
					<Button class="mt-4" on:click={() => openDrawerForProduct(stall.id)}>Edit stall</Button>
				{/if}
			</div>
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2>Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each stall.products as item}
							<ProductItem product={item} />
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
