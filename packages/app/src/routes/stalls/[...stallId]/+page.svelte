<script lang="ts">
	import type { Selected } from 'bits-ui'
	import AdminActions from '$lib/components/common/admin-actions.svelte'
	import TruncatedText from '$lib/components/common/truncatedText.svelte'
	import ProductItem from '$lib/components/product/product-item.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import { Button } from '$lib/components/ui/button'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import * as Select from '$lib/components/ui/select'
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { openDrawerForStall } from '$lib/stores/drawer-ui'
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
		stallId: stall.id,
	})
	let isMyStall = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyStall = $ndkStore.activeUser?.pubkey == user.id
		}
	}
</script>

<main class="px-4 lg:px-12">
	<div class="flex flex-col gap-14">
		{#if $stallQuery.data?.stall}
			{@const { image, name, description, currency, createDate, shipping } = $stallQuery.data.stall}
			<div class="flex flex-col gap-2">
				{#if image}
					<div class="border-black border-2 w-full h-auto max-h-[45vh] overflow-hidden flex items-center justify-center">
						<img src={image} alt="stall-cover" />
					</div>
				{:else}
					<div
						style={`background-color: ${stringToHexColor(stall.id)}`}
						class={`border-black w-full border-2 h-[10vh] relative overflow-hidden`}
					/>
				{/if}
				{#if name}
					<h1 class="text-3xl">{truncateText(name, 50)}</h1>
				{/if}
				{#if description}
					<TruncatedText text={description} />
				{/if}
			</div>
			<div class="flex sm:flex-row flex-col gap-12">
				<section class="w-fit">
					{#if $userProfileQuery.data?.name || $userProfileQuery.data?.displayName}
						<a href={`/p/${$userProfileQuery.data?.nip05 ? $userProfileQuery.data?.nip05 : user.id}`} class="flex flex-col items-center">
							<CAvatar pubkey={String(user.id)} profile={$userProfileQuery.data} />
							<span>{truncateText(String($userProfileQuery.data?.name || $userProfileQuery.data?.displayName), 15)}</span>
						</a>
					{:else if $userProfileQuery.data?.id}
						<a href={`/p/${$userProfileQuery.data?.id}`} class="flex flex-col items-center">
							<CAvatar pubkey={String(user.id)} profile={$userProfileQuery.data} />
							<span>Unnamed user</span>
						</a>
					{:else}
						<Skeleton class="h-24 w-24 rounded-full" />
					{/if}
				</section>
				<Accordion.Root class="w-full sm:max-w-sm">
					<Accordion.Item value="item-1">
						<Accordion.Trigger>More info</Accordion.Trigger>
						<Accordion.Content>
							<div class=" flex flex-col gap-2 items-start">
								{#if shipping?.length}
									<span class=" font-bold">Shipping zones</span>
									<section class="gap-2">
										{#each shipping as shipping}
											<div class=" flex gap-2">
												{#if shipping.name || shipping.id}
													<span>{truncateString(shipping.name || shipping.id || '')}</span>
												{/if}
												{#if shipping.regions}
													{#each shipping.regions as region}
														<Badge variant="secondary">{region}</Badge>
													{/each}
												{/if}
												{#if shipping.countries}
													{#each shipping.countries as country}
														<Badge variant="secondary">{country}</Badge>
													{/each}
												{/if}
											</div>
										{/each}
									</section>
								{/if}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
				<div class="flex flex-col">
					<span>currency: {currency}</span>
					<span>created: {createDate}</span>
				</div>
				<AdminActions type="stall" id={stall.id} />
			</div>

			{#if isMyStall}
				<Button class="mt-4 w-fit" on:click={() => openDrawerForStall(stall.id)}>Edit stall</Button>
			{/if}
		{:else}
			<section class=" flex flex-col gap-2">
				{#each [...Array(6)] as _, i}
					<Skeleton class="h-8 w-[250px]" />
				{/each}
			</section>
		{/if}
	</div>
	{#if $productsQuery.data}
		{@const { products } = $productsQuery.data}
		<h2>Products</h2>

		<Select.Root selected={sort} onSelectedChange={onSortSelectedChange}>
			<Select.Trigger class="w-[100px]">
				<Select.Value placeholder="Sort" />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="desc">Latest</Select.Item>
				<Select.Item value="asc">Oldest</Select.Item>
			</Select.Content>
		</Select.Root>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-6">
			{#if products.length}
				{#each products as item (item.id)}
					<ProductItem product={item} />
				{/each}
			{/if}
		</div>
	{:else}
		<div class="flex gap-4 mt-6">
			{#each [...Array(3)] as _, i}
				<Skeleton class=" h-80 w-full border-4 border-black text-black group" />
			{/each}
		</div>
	{/if}
</main>
