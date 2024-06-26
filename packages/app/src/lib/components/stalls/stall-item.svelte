<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'

	import { Button } from '../ui/button'

	export let stall: RichStall
	const { name, createDate, description, userName, currency, productCount, orderCount, userNip05, identifier, id } = stall

	let isMyStall = false

	$: {
		const userId = $ndkStore.activeUser?.pubkey
		isMyStall = userId === stall.userId
	}
</script>

<Card.Root class="relative grid grid-rows-[auto_1fr_auto] h-[34vh] gap-4 border-4 border-black bg-transparent text-black group">
	<a href={userNip05 ? `/stalls/${userNip05.toLocaleLowerCase()}/${identifier}` : `/stalls/${id?.replace(/^30017:/, '')}`}>
		<Card.Header class="flex flex-col justify-between py-2 pb-0">
			<span class="truncate text-2xl font-bold">{name}</span>
			<span class="font-red font-bold">Since: {createDate}</span>
			{isMyStall}
		</Card.Header>
	</a>
	<Card.Content class="relative flex-grow truncate whitespace-normal">
		<p>{description}</p>
		{#if isMyStall}
			<div
				class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<Button class="bg-white" on:click={() => openDrawerForStall(id)}>Edit stall</Button>
				<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(id)}>Add product</Button>
			</div>
		{/if}
	</Card.Content>
	<a href={userNip05 ? `/stalls/${userNip05.toLocaleLowerCase()}/${identifier}` : `/stalls/${id?.replace(/^30017:/, '')}`}>
		<Card.Footer class="flex flex-col items-start font-bold">
			<div class="flex items-center gap-1">
				<div class="flex flex-col">
					{#if userName}
						<span class="whitespace-normal">Owner: {userName}</span>
					{/if}
					{#if userNip05}
						<small class="truncate font-light whitespace-normal">{userNip05}</small>
					{:else}
						<small class="font-light truncate whitespace-normal">@{truncateString(npubEncode(stall.userId))}</small>
					{/if}
				</div>
			</div>
			<span class="whitespace-normal">Currency: {currency}</span>
			{#if productCount}
				<span class="whitespace-normal">{productCount} products</span>
			{/if}
		</Card.Footer>
	</a>
</Card.Root>
