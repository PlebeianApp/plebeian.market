import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import ndkStore from '$lib/stores/ndk'
import { parseCoordinatesString } from '$lib/utils'
import { get } from 'svelte/store'

export async function publishEvent(event: NDKEvent): Promise<boolean> {
	const isTest = get(page).data?.isTest
	try {
		if (isTest || import.meta.env.MODE === 'development') {
			await event.sign()
		} else {
			await event.publish()
		}
		return true
	} catch (error) {
		console.error('Error publishing event:', error)
		return false
	}
}

export async function requestDeletion(
	eventCoordinates?: string,
	eventId?: string,
	reason?: string,
	publish: boolean = true,
): Promise<NDKEvent> {
	const $ndkStore = get(ndkStore)
	const deletionEvent = new NDKEvent($ndkStore)

	if (eventCoordinates) {
		const parsedCoordinates = parseCoordinatesString(eventCoordinates)
		deletionEvent.kind = NDKKind.EventDeletion
		deletionEvent.content = reason || ''
		deletionEvent.tags = [['a', parsedCoordinates.coordinates!]]
	}

	if (eventId) {
		deletionEvent.kind = NDKKind.EventDeletion
		deletionEvent.content = reason || ''
		deletionEvent.tags = [['e', eventId]]
	}
	if (publish) {
		await publishEvent(deletionEvent)
	}

	return deletionEvent
}
