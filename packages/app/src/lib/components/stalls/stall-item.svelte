<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { ZodError } from 'zod'
	import * as Card from '$lib/components/ui/card/index'
	import { normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import { Button } from '../ui/button'

	export let stallData: Partial<RichStall> | NDKEvent

	let stall: Partial<RichStall>
	let parseError: ZodError | null
	let isMyStall: boolean

	async function handleNDKEvent(event: NDKEvent) {
		const authorPk = event.author.pubkey
		const { data: parsedStall, error: _parseError } = normalizeStallData(event)
		parseError = _parseError

		if (!parsedStall || !parsedStall.shipping || !parsedStall.name) return

		isMyStall = $ndkStore.activeUser?.pubkey === authorPk
		const user = $ndkStore.getUser({ pubkey: authorPk })
		const userProfile = await user.fetchProfile()

		if (userProfile) {
			parsedStall.userName = userProfile.name || userProfile.displayName || ''
			parsedStall.userNip05 = userProfile.nip05
		}

		stall = parsedStall
	}

	onMount(async () => {
		if ('kind' in stallData) {
			await handleNDKEvent(stallData as NDKEvent)
		} else {
			isMyStall = $ndkStore.activeUser?.pubkey === stall.userId
			stall = stall
		}
	})
</script>

{#if stall}
	<Card.Root class="relative grid grid-rows-[auto_1fr_auto] h-[34vh] gap-4 border-4 border-black bg-transparent text-black group">
		<a
			href={stall.userNip05
				? `/stalls/${stall.userNip05.toLocaleLowerCase()}/${stall.identifier}`
				: `/stalls/${stall.id?.replace(/^30017:/, '')}`}
		>
			<Card.Header class="flex flex-col justify-between py-2 pb-0">
				{#if parseError}
					{JSON.stringify(parseError)}
				{/if}
				{#if stall.name}
					<span class="truncate text-2xl font-bold whitespace-normal">{stall.name}</span>
				{/if}
				<span class="font-bold whitespace-normal">Since: {stall.createDate}</span>
			</Card.Header>
		</a>
		<Card.Content class="relative flex-grow truncate whitespace-normal">
			<p>{stall.description}</p>
			{#if isMyStall && stall.id}
				<div
					class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<Button class="bg-white" on:click={() => openDrawerForStall(String(stall.id))}>Edit stall</Button>
					<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(String(stall.id))}>Add product</Button>
				</div>
			{/if}
		</Card.Content>
		<a
			href={stall.userNip05
				? `/stalls/${stall.userNip05.toLocaleLowerCase()}/${stall.identifier}`
				: `/stalls/${stall.id?.replace(/^30017:/, '')}`}
		>
			<Card.Footer class="flex flex-col items-start font-bold">
				<div class="flex items-center gap-1">
					<div class="flex flex-col">
						{#if stall.userName}
							<span class="whitespace-normal">Owner: {stall.userName}</span>
						{/if}
						{#if stall.userNip05}
							<small class="truncate font-light whitespace-normal">{stall.userNip05}</small>
						{:else}
							<small class="font-light truncate whitespace-normal">@{truncateString(npubEncode(stall.id?.split(':')[1]))}</small>
						{/if}
					</div>
				</div>
				<span class="whitespace-normal">Currency: {stall.currency}</span>
				{#if stall.productCount}
					<span class="whitespace-normal">{stall.productCount} products</span>
				{/if}
			</Card.Footer>
		</a>
	</Card.Root>
{/if}
