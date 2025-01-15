<script lang="ts">
	import type { Selected } from 'bits-ui'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import SkeletonLoader from '$lib/components/common/skeletonLoader.svelte'
	import TruncatedText from '$lib/components/common/truncatedText.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor, truncateString, truncateText } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const { stall, user } = data

	let sort: Selected<'asc' | 'desc'> = {
		label: 'Latest',
		value: 'desc',
	}

	function onSortSelectedChange(v?: typeof sort) {
		sort = v!
	}

	$: userProfileQuery = createUserByIdQuery(String(user.id))

	$: stallQuery = createStallQuery(stall.id)

	$: productsQuery = createProductsByFilterQuery({
		pageSize: 12,
		page: 1,
		order: sort.value ?? 'desc',
		stallId: stall.id,
	})

	let isMyStall = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyStall = $ndkStore.activeUser?.pubkey == user.id
		}
	}
</script>

<main class="relative">
	<div class="flex flex-col gap-12">
		{#if $stallQuery.data?.stall}
			{@const { image, name, description, currency, createDate, shipping } = $stallQuery.data.stall}
			<div class="flex flex-col">
				{#if image}
					<div class="w-full aspect-[3/1] md:aspect-[6.125/1] overflow-hidden flex items-center justify-center">
						<img src={image} alt="stall-cover" class="w-full h-full object-cover" />
					</div>
				{:else}
					<div
						style={`background-color: ${stringToHexColor(stall.id)}`}
						class={`border-black w-full border-2 aspect-[6.125/1] relative overflow-hidden`}
					/>
				{/if}
				{#if name}
					<div class="flex flex-col pl-8 pt-4 bg-off-black">
						<h2 class="text-2xl text-white">{truncateText(name, 50)}</h2>
					</div>
				{/if}
			</div>
			<div class="flex flex-col gap-12 px-8">
				<div class="flex flex-col md:flex-row gap-4 w-full">
					{#if description}
						<Card class="rounded-none border-t-2 border-b-0 border-l-0 border-r-0 border-black shadow-lg flex-1">
							<CardHeader>
								<CardTitle>
									<div class="flex flex-row gap-2 items-center justify-between">
										<div class="flex flex-row gap-2 items-center">
											<a href={`/p/${user.id}`}>
												<CAvatar
													pubkey={String(user.id)}
													profile={$userProfileQuery.data}
													avatarClass="rounded-md w-8 h-8"
													imageClass="rounded-md w-8 h-8"
													fallbackClass="rounded-md w-8 h-8"
												/>
											</a>
											<span>{$userProfileQuery.data?.name || $userProfileQuery.data?.displayName || truncateText(user.id)}</span>
										</div>
										<span class="text-sm text-gray-500">created: {createDate}</span>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent class="flex flex-col gap-6">
								<span class=" font-bold text-gray-500">Description</span>
								<TruncatedText text={description} />
								<AdminActions type="stall" id={stall.id} isFeatured={$stallQuery.data.stall.isFeatured} />
							</CardContent>
						</Card>
					{/if}
					<Card class="rounded-none border-t-2 border-b-0 border-l-0 border-r-0 border-black shadow-lg flex-none w-full md:w-1/5">
						<CardHeader>
							<CardTitle>Shipping Zones</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex flex-col gap- items-start">
								{#if shipping?.length}
									<section class="gap-">
										{#each shipping as shipping}
											{#if shipping.name || shipping.id}
												<span>{truncateString(shipping.name || shipping.id || '')}</span>
											{/if}
											<div class="flex flex-row gap-2 flex-wrap">
												{#if shipping.regions}
													{#each shipping.regions as region}
														<Badge size="sm" class="w-fit" variant="secondary">{region}</Badge>
													{/each}
												{/if}
												{#if shipping.countries}
													{#each shipping.countries as country}
														<Badge size="sm" class="w-fit" variant="secondary">{country}</Badge>
													{/each}
												{/if}
											</div>
										{/each}
									</section>
								{/if}
							</div>
						</CardContent>
					</Card>
					<Card class="rounded-none border-t-2 border-b-0 border-l-0 border-r-0 border-black shadow-lg flex-none w-full md:w-1/5">
						<CardHeader>
							<CardTitle>Currency</CardTitle>
						</CardHeader>
						<CardContent>
							<span>{currency}</span>
						</CardContent>
					</Card>
				</div>
			</div>

			{#if isMyStall}
				<div class="flex flex-row gap-2">
					<Button variant="primary" class="mt-4 w-fit" on:click={() => openDrawerForStall(stall.id)}>Edit stall</Button>
					<Button variant="primary" class="mt-4 w-fit" on:click={() => openDrawerForNewProductForStall(stall.id)}>Add product</Button>
				</div>
			{/if}
		{:else}
			<section class=" flex flex-col gap-2">
				<SkeletonLoader count={6} class="h-8 w-[250px]" />
			</section>
		{/if}
	</div>

	{#if $productsQuery.data?.products.length}
		{@const { products } = $productsQuery.data}
		<ItemGrid title="Products" withSort={false} on:sortSelectedChange={(e) => onSortSelectedChange(e.detail.value)}>
			{#if products.length}
				{#each products as item (item.id)}
					<ProductItem product={item} />
				{/each}
			{/if}
		</ItemGrid>
	{:else if $productsQuery.isSuccess && !$productsQuery.data}
		<div class=" py-6">
			<h3>No products found</h3>
		</div>
	{:else}
		<div class="flex gap-4 mt-6">
			<SkeletonLoader count={3} class=" h-80 w-full border-4 border-black text-black group" />
		</div>
	{/if}
</main>
