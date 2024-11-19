import { NDKEvent } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import { stallsSub } from '$lib/nostrSubs/subs'
import { fetchAddressableEvent } from '$lib/nostrSubs/utils'
import { relayReports } from '$lib/stores/relayReports'
import { unixTimeNow } from '$lib/utils'
import { get } from 'svelte/store'

export async function publishEvent(event: NDKEvent): Promise<NDKEvent | null> {
	const isTest = get(page).data?.isTest
	try {
		if (isTest) {
			await event.sign()
		} else {
			const publishedRelays = await event.publish()
			relayReports.addReport(publishedRelays, event.kind?.toString() || 'unknown')
		}
		return event
	} catch (error) {
		console.error('Error publishing event:', error)
		return null
	}
}

export async function deleteEvent(eventCoordinates?: string, reason?: string, publish = true): Promise<NDKEvent | null> {
	if (!eventCoordinates) {
		return null
	}

	const event = await fetchAddressableEvent(eventCoordinates)
	if (!event) {
		return null
	}

	const emptyEvent = event
	const dTag = emptyEvent.dTag
	emptyEvent.content = ''
	emptyEvent.created_at = unixTimeNow()
	emptyEvent.tags = dTag ? [['d', dTag], ['deleted']] : [['deleted']]

	const publishedEmptyEvent = await publishEvent(emptyEvent)
	if (!publishedEmptyEvent) {
		return null
	}

	const deletedEvent = await publishedEmptyEvent.delete(reason, false)
	await publishEvent(deletedEvent)
	if (deletedEvent && dTag) {
		stallsSub?.update((stalls) => stalls.filter((stall) => stall.dTag !== dTag))
	}

	return deletedEvent
}
