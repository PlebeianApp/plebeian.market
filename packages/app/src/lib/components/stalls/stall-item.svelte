<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { ZodError } from 'zod'
	import * as Card from '$lib/components/ui/card/index'
	import { normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import { Button } from '../ui/button'

	export let stallData: Partial<RichStall> | NDKEvent

	let stall: Partial<RichStall>
	let parseError: ZodError | null
	let isMyStall: boolean

	async function handleNDKEvent(event: NDKEvent) {
		const authorPk = event.author.pubkey
		const { data: parsedStall, error: _parseError } = await normalizeStallData(event)
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
		if (!stallData) return
		if ('kind' in stallData) {
			await handleNDKEvent(stallData as NDKEvent)
		} else {
			isMyStall = $ndkStore.activeUser?.pubkey === (stallData as Partial<RichStall>).userId
			stall = stallData
		}
	})
</script>

{#if stall}
	<Card.Root class="relative grid grid-rows-[auto_1fr_auto] h-[44vh] border-2 border-black text-black group overflow-hidden">
		<a
			href={stall.userNip05
				? `/stalls/${stall.userNip05.toLocaleLowerCase()}/${stall.identifier}`
				: `/stalls/${stall.id?.replace(/^30017:/, '')}`}
		>
			<Card.Header class="p-0">
				{#if stall.image}
					<div class="h-[25vh]">
						<img src={stall.image} alt="stall" class="object-cover w-full h-full" />
					</div>
				{:else if stall.id}
					<div style={`background-color: ${stringToHexColor(stall.id)}`} class="h-[5vh]" />
				{/if}
			</Card.Header>
		</a>
		<Card.Content class="relative p-2 break-words">
			<a
				href={stall.userNip05
					? `/stalls/${stall.userNip05.toLocaleLowerCase()}/${stall.identifier}`
					: `/stalls/${stall.id?.replace(/^30017:/, '')}`}
			>
				<span class="truncate text-xl font-bold whitespace-normal">{stall.name}</span>
				<p class="text-sm font-light max-w-[90%]">
					{truncateText(stall?.description, 121)}
				</p>
			</a>
		</Card.Content>
		<a
			href={stall.userNip05
				? `/stalls/${stall.userNip05.toLocaleLowerCase()}/${stall.identifier}`
				: `/stalls/${stall.id?.replace(/^30017:/, '')}`}
		>
			<Card.Footer class="flex flex-col items-start font-bold p-2">
				<div class="flex flex-col xl:flex-row justify-between w-full text-sm">
					<span class="font-bold whitespace-normal">Since: {stall.createDate}</span>
					<span class="whitespace-normal">Currency: {stall.currency}</span>
				</div>

				<div class="flex flex-col xl:flex-row justify-between w-full text-sm">
					{#if stall.userName}
						<span class="whitespace-normal">Owner: {stall.userName}</span>
					{/if}
					{#if stall.userNip05}
						<small class="truncate font-light whitespace-normal">{truncateText(stall.userNip05, 21)}</small>
					{:else}
						<small class="font-light truncate whitespace-normal">@{truncateString(npubEncode(stall.userId))}</small>
					{/if}
				</div>
			</Card.Footer>
		</a>
		{#if isMyStall && stall.id}
			<div
				class="flex flex-col gap-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<Button class="bg-white" on:click={() => openDrawerForStall(String(stall.id))}>Edit stall</Button>
				<Button class="bg-white" on:click={() => openDrawerForNewProductForStall(String(stall.id))}>Add product</Button>
			</div>
		{/if}
	</Card.Root>
{/if}
