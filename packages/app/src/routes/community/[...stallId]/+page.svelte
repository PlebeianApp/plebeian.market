<script lang="ts">
	import type { Selected } from 'bits-ui'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import Hero from '$lib/components/common/hero.svelte'
	import ItemGrid from '$lib/components/common/item-grid.svelte'
	import SharingButton from '$lib/components/common/sharing-button.svelte'
	import SkeletonLoader from '$lib/components/common/skeletonLoader.svelte'
	import TruncatedText from '$lib/components/common/truncatedText.svelte'
	import ShippingsDialog from '$lib/components/dialogs/shippingsDialog.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import { badgeVariants } from '$lib/components/ui/badge'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { breakpoint, getGridColumns } from '$lib/stores/breakpoint'
	import { dialogs } from '$lib/stores/dialog'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { handleBack, stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { getMediaType } from '$lib/utils/media.utils'
	import { getProfileName } from '$lib/utils/userProfile.utils'
	import { ArrowLeft } from 'lucide-svelte'
	import { MetaTags } from 'svelte-meta-tags'

	import type { PageData } from './$types'

	export let data: PageData
	const { stall, user, pageMetaTags } = data

	let sort: Selected<'asc' | 'desc'> = {
		label: 'Latest',
		value: 'desc',
	}

	function onSortSelectedChange(v?: typeof sort) {
		sort = v!
	}

	$: userProfileQuery = createUserByIdQuery(String(user.id))

	$: stallQuery = createStallQuery(stall.id)

	let isMyStall = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyStall = $ndkStore.activeUser?.pubkey == user.id
		}
	}

	$: productsQuery = createProductsByFilterQuery({
		pageSize: getGridColumns($breakpoint, 'product') * 4,
		page: 1,
		order: sort.value ?? 'desc',
		stallId: stall.id,
	})
</script>

<MetaTags {...pageMetaTags} />

<main class="relative">
	<Button variant="ghost" class="absolute top-4 left-4 z-10 flex items-center gap-2 text-white" on:click={handleBack}>
		<ArrowLeft class="w-4 h-4" />
		<span>Back</span>
	</Button>
	<div class="flex flex-col gap-12">
		{#if $stallQuery.data?.stall}
			{@const { image, name, description, currency, createDate, shipping } = $stallQuery.data.stall}
			<div class="flex flex-col">
				{#if image}
					<div class="w-full aspect-[3/1] md:aspect-[6.125/1] overflow-hidden flex items-center justify-center">
						{#if getMediaType(image) === 'video'}
							<video src={image} class="w-full h-full object-cover" preload="metadata" muted loop autoplay>
								<track kind="captions" />
							</video>
						{:else}
							<img src={image} alt="stall-cover" class="w-full h-full object-cover" />
						{/if}
					</div>
				{:else}
					<Hero class="w-full aspect-[6.125/1] justify-center relative overflow-hidden" gradientColor={stringToHexColor(stall.id)} py="8">
						<div class="flex flex-row gap-2 justify-center z-10">
							<span class="i-mdi-store text-white/90 w-12 h-12 opacity-60" />
						</div>
					</Hero>
				{/if}
				{#if name}
					<div class="flex flex-row justify-between px-6 pt-2 bg-off-black">
						<div class="flex flex-col gap-2 items-center">
							<h2 class="text-2xl text-white">{truncateText(name, 50)}</h2>
						</div>
						<SharingButton
							title={$stallQuery.data?.stall?.name || 'Check out this stall'}
							text={`Check out my shop ${$stallQuery.data?.stall?.name} on #plebeianmarket: ${$stallQuery.data?.stall?.description}`}
							url={window.location.href}
						/>
					</div>
				{/if}
			</div>
			<div class="flex flex-col gap-12 px-8">
				<div class="flex flex-col md:flex-row gap-4 w-full">
					<Card class="rounded-none border-t-2 border-b-0 border-l-0 border-r-0 border-black shadow-lg flex-1">
						<CardHeader>
							<CardTitle>
								<div class="flex flex-row gap-2 items-center justify-between">
									<div class="flex flex-row gap-2 items-center overflow-hidden text-ellipsis">
										<CAvatar
											pubkey={String(user.id)}
											profile={$userProfileQuery.data ?? null}
											avatarClass="rounded-md w-8 h-8"
											imageClass="rounded-md w-8 h-8"
											fallbackClass="rounded-md w-8 h-8"
											linked
										/>
										<span>{getProfileName($userProfileQuery.data ?? null, user.id)}</span>
									</div>
									<span class="text-sm text-muted-foreground md:flex-row">created: {createDate}</span>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col gap-6">
							{#if description}
								<span class=" font-bold text-gray-500">Description</span>
								<TruncatedText text={description} />
							{:else}
								<span class=" text-muted-foreground">No description provided</span>
							{/if}
							<AdminActions type="stall" id={stall.id} isFeatured={$stallQuery.data.stall.isFeatured} />
						</CardContent>
					</Card>
					<Card class="rounded-none border-t-2 border-b-0 border-l-0 border-r-0 border-black shadow-lg flex-none w-full md:w-1/5">
						<CardHeader>
							<CardTitle>Shipping Zones</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex flex-col gap- items-start">
								{#if shipping?.length}
									<section class="flex flex-col gap-1 w-full">
										{#each shipping as shipping}
											{#if shipping.name || shipping.id}
												<section class=" inline-flex gap-2 flex-wrap justify-between">
													<span class=" font-bold">{truncateString(shipping.name || shipping.id || '')}</span>
													<span>{shipping.cost} {$stallQuery?.data?.stall.currency}</span>
												</section>
											{/if}
											<div class="flex flex-row gap-1 flex-wrap">
												{#if shipping.regions}
													{#each shipping.regions.slice(0, 3) as region}
														<Badge size="sm" class="w-fit" variant="secondary">{region}</Badge>
													{/each}
													{#if shipping.regions.length > 3}
														<Button
															size="none"
															class={badgeVariants({ variant: 'secondary' })}
															variant="outline"
															on:click={() =>
																dialogs.show(ShippingsDialog, {
																	title: 'Shipping Regions',
																	items: shipping.regions,
																})}
														>
															+{shipping.regions.length - 3} more
														</Button>
													{/if}
												{/if}
												{#if shipping.countries}
													{#each shipping.countries.slice(0, 3) as country}
														<Badge size="sm" class="w-fit" variant="secondary">{country}</Badge>
													{/each}
													{#if shipping.countries.length > 3}
														<Button
															size="none"
															class={badgeVariants({ variant: 'secondary' })}
															variant="outline"
															on:click={() =>
																dialogs.show(ShippingsDialog, {
																	title: 'Shipping Countries',
																	items: shipping.countries,
																})}
														>
															+{shipping.countries.length - 3} more
														</Button>
													{/if}
												{/if}
											</div>
											<Separator />
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
				<div class="flex flex-row gap-2 mx-8">
					<Button variant="primary" class="mt-4 w-fit" on:click={() => openDrawerForStall(stall.id)}>Edit stall</Button>
					<Button variant="primary" class="mt-4 w-fit" on:click={() => openDrawerForNewProductForStall(stall.id)}>Add a product</Button>
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
		<div class="mx-4">
			<ItemGrid title="Products" withSort={false} on:sortSelectedChange={(e) => onSortSelectedChange(e.detail.value)}>
				{#if products.length}
					{#each products as item (item.id)}
						<ProductItem product={item} />
					{/each}
				{/if}
			</ItemGrid>
		</div>
	{:else if $productsQuery.isSuccess && !$productsQuery.data}
		<div class="my-16 mx-8">
			<h3>No products found</h3>
		</div>
	{:else}
		<div class="flex gap-4 my-16 mx-8">
			<SkeletonLoader count={3} class=" h-80 w-full border-none border-black text-black group" />
		</div>
	{/if}
</main>
