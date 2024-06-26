<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import { Button } from '../ui/button'

	export let stall: RichStall
	const { name, createDate, description, userName, currency, productCount, orderCount, userNip05, identifier, id } = stall

	let isMyStall = false

	$: {
		const userId = $ndkStore.activeUser?.pubkey
		isMyStall = userId === stall.userId
	}
</script>

<Card.Root class="relative flex h-[34vh] flex-col gap-4 border-4 border-black bg-transparent text-black group">
	<Card.Header class="flex flex-col justify-between">
		<span class="truncate text-2xl font-bold">{name}</span>
		<span class="font-red font-bold">Since: {createDate}</span>
		{isMyStall}
	</Card.Header>
	<div class="relative grow p-4">
		<p>{description}</p>
		{#if isMyStall}
			<div
				class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<Button class="bg-white" on:click={() => openDrawerForStall(id)}>Edit stall</Button>
				<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(id)}>Add product</Button>
			</div>
		{/if}
	</div>

	<Card.Footer>
		<a class="flex flex-col items-start font-bold" href={userNip05 ? `/stalls/${userNip05}/${identifier}` : `/stalls/${id}`}>
			<span>Owner: {userName}</span>
			<span>Currency: {currency}</span>
			<span>{productCount} products</span>
		</a>
	</Card.Footer>
</Card.Root>
