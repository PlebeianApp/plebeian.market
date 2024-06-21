<script lang="ts">
	import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import { standardDisplayDateFormat } from '$lib/constants'
	import { stallsFilterSchema } from '$lib/schema'
	import { fetchUserProfile, getEventCoordinates } from '$lib/utils'
	import { format } from 'date-fns'
	import { onMount } from 'svelte'

	import { stallEventSchema } from '../../../schema/nostr-events'

	export let stall: RichStall | NDKEvent

	let normalizedStall: RichStall | undefined

	async function normalizeStallData(stall: RichStall | NDKEvent): Promise<RichStall> {
		if ('sig' in stall) {
			const eventCoordinates = getEventCoordinates(stall)
			const stallEventContent = stallEventSchema.parse(JSON.parse(stall.content))
			const userProfile = await fetchUserProfile(stall.pubkey)
			return {
				name: stallEventContent.name,
				createDate: format(stall.created_at ? stall.created_at * 1000 : '', standardDisplayDateFormat),
				description: stallEventContent.description,
				userName: userProfile?.name,
				currency: stallEventContent.currency,
				userNip05: userProfile?.nip05,
				identifier: eventCoordinates.tagD,
				id: eventCoordinates.coordinates,
				userId: stall.pubkey,
			} as RichStall
		} else {
			return stall as RichStall
		}
	}

	onMount(async () => {
		normalizedStall = await normalizeStallData(stall)
	})
</script>

{#if normalizedStall}
	{@const { name, createDate, description, userName, currency, productCount, userNip05, identifier, id } = normalizedStall}
	<a href={userNip05 ? `/stalls/${userNip05}/${identifier}` : `/stalls/${id}`}>
		<Card.Root class="flex h-[34vh] cursor-pointer flex-col gap-4 border-4 border-black bg-transparent text-black">
			<Card.Header class="flex flex-col justify-between">
				<span class="truncate text-2xl font-bold">{name}</span>
				<span class="font-red font-bold">Since: {createDate}</span>
			</Card.Header>
			<Card.Content class="max-h-[33%] flex-grow overflow-hidden">{description}</Card.Content>

			<Card.Footer class="flex flex-col items-start font-bold">
				<div class=" flex items-center gap-1">
					<div class=" flex flex-col">
						<span class="">Owner: {userName}</span>
						{#if userNip05}
							<small class=" truncate font-light">{userNip05}</small>
						{/if}
					</div>
				</div>
				<span>Currency: {currency}</span>
				{#if productCount}
					<span>{productCount} products</span>
				{/if}
			</Card.Footer>
		</Card.Root>
	</a>
{/if}
