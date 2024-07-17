<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor, truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import ImgPlaceHolder from '../product/imgPlaceHolder.svelte'
	import { Button } from '../ui/button'

	export let stall: Partial<RichStall>

	const { name, createDate, description, currency, productCount, identifier, id } = stall
	let { userName, userNip05 } = stall

	let isMyStall = false

	$: {
		if ($ndkStore.activeUser?.pubkey) {
			isMyStall = $ndkStore.activeUser.pubkey === id?.split(':')[1]
		}
	}

	onMount(async () => {
		if (!userName || !userNip05) {
			const user = $ndkStore.getUser({
				pubkey: id?.split(':')[1],
			})
			const userProfile = await user.fetchProfile()
			if (userProfile) {
				userName = userProfile?.name ?? userProfile.displayName
				userNip05 = userProfile.nip05
			}
		}
	})
</script>

<Card.Root class="relative grid grid-rows-[auto_1fr_auto] h-[40vh] gap-4 border-4 border-black bg-transparent text-black group">
	<Card.Content class="relative p-0 flex-grow truncate whitespace-normal">
		{#if stall && stall.id}
			<div class="h-[28vh]">
				{#if stall.image}
					<img src={stall.image} alt="stall" class="object-cover w-full h-full" />
				{:else}
					<div class="object-cover w-full h-full">
						<ImgPlaceHolder width={500} height={300} imageType={'manual'} fillColor={stringToHexColor(stall.id)} />
					</div>
				{/if}
			</div>
			{#if isMyStall}
				<div
					class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<Button class="bg-white" on:click={() => openDrawerForStall(id)}>Edit stall</Button>
					<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(id)}>Add product</Button>
				</div>
			{/if}
		{/if}
	</Card.Content>
	<a href={userNip05 ? `/stalls/${userNip05.toLocaleLowerCase()}/${identifier}` : `/stalls/${id?.replace(/^30017:/, '')}`}>
		<Card.Footer class="flex flex-col items-start font-bold">
			<span class="truncate text-xl font-bold whitespace-normal">{name}</span>
			<p class="h-20 overflow-hidden text-sm font-light">
				{#if description.length > 100}
					{description.slice(0, 100)}...
				{:else}
					{description}
				{/if}
			</p>

			<div class="flex flex-row justify-between w-full text-sm">
				<span class="font-bold whitespace-normal">Since: {createDate}</span>
				<span class="whitespace-normal">Currency: {currency}</span>
			</div>

			<div class="flex flex-row justify-between w-full text-sm">
				{#if userName}
					<span class="whitespace-normal">Owner: {userName}</span>
				{/if}
				{#if userNip05}
					<small class="truncate font-light whitespace-normal">{userNip05}</small>
				{:else}
					<small class="font-light truncate whitespace-normal">@{truncateString(npubEncode(stall.userId))}</small>
				{/if}
			</div>
		</Card.Footer>
	</a>
</Card.Root>
