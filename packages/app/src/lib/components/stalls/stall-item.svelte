<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import { normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import { Button } from '../ui/button'

	export let stallData: Partial<RichStall> | NDKEvent

	let stall: Partial<RichStall> = {}
	$: isMyStall = $ndkStore.activeUser?.pubkey === stall?.userId

	async function processStallData() {
		if (!stallData) return

		if ('kind' in stallData) {
			const { data: parsedStall, error: parseError } = await normalizeStallData(stallData)
			if (!parsedStall || parseError) return

			const user = $ndkStore.getUser({ pubkey: stallData.author.pubkey })
			const userProfile = await user.fetchProfile()

			stall = {
				...parsedStall,
				userName: userProfile?.name || userProfile?.displayName || '',
				userNip05: userProfile?.nip05,
			}
		} else {
			stall = stallData
		}
	}

	onMount(processStallData)

	$: stallUrl = stall.userNip05
		? `/stalls/${stall.userNip05.toLowerCase()}/${stall.identifier}`
		: `/stalls/${stall.id?.replace(/^30017:/, '')}`
</script>

{#if stall.id}
	<Card.Root class="relative grid grid-rows-[auto_1fr_auto] h-[44vh] border-2 border-black text-black group overflow-hidden">
		<a href={stallUrl}>
			<Card.Header class="p-0">
				{#if stall.image}
					<img src={stall.image} alt="stall" class="object-cover w-full h-[25vh]" />
				{:else}
					<div style={`background-color: ${stringToHexColor(stall.id)}`} class="h-[5vh]" />
				{/if}
			</Card.Header>
		</a>
		<Card.Content class="relative p-2 break-words">
			<a href={stallUrl}>
				<span class="truncate text-xl font-bold whitespace-normal">{stall.name}</span>
				{#if stall.description}
					<p class="text-sm font-light max-w-[90%]">
						{truncateText(stall.description, 121)}
					</p>
				{/if}
			</a>
		</Card.Content>
		<a href={stallUrl}>
			<Card.Footer class="flex flex-col items-start font-bold p-2">
				<div class="flex flex-col 2xl:flex-row justify-between w-full text-sm">
					<span class="whitespace-normal">Currency: {stall.currency}</span>
				</div>
				<div class="flex flex-col 2xl:flex-row justify-between w-full text-sm">
					{#if stall.userName}
						<span class="whitespace-normal">Owner: {stall.userName}</span>
					{/if}
					<small class="font-light truncate whitespace-normal">
						{stall.userNip05 ? truncateText(stall.userNip05, 21) : `@${truncateString(npubEncode(stall.userId))}`}
					</small>
				</div>
			</Card.Footer>
		</a>
		{#if isMyStall}
			<div
				class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<Button class="bg-white" on:click={() => openDrawerForStall(stall.id)}>Edit stall</Button>
				<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(stall.id)}>Add product</Button>
			</div>
		{/if}
	</Card.Root>
{/if}
