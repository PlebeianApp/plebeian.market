import { NDKEvent } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import { fetchAddressableEvent } from '$lib/nostrSubs/utils'
import { get } from 'svelte/store'

export async function publishEvent(event: NDKEvent): Promise<NDKEvent | null> {
	const isTest = get(page).data?.isTest
	try {
		if (isTest || import.meta.env.MODE === 'development') {
			console.log('Signing event:', event)
			await event.sign()
		} else {
			console.log('Publishing event:', event)
			const publish = await event.publish()
			console.log('Event published:', publish)
		}
		return event
	} catch (error) {
		console.error('Error publishing event:', error)
		return null
	}
}

export async function deleteEvent(eventCoordinates?: string, reason?: string, publish: boolean = true): Promise<NDKEvent | null> {
	if (!eventCoordinates) return null

	const event = await fetchAddressableEvent(eventCoordinates)
	if (!event) return null

	const emptyEvent = event
	const dTag = emptyEvent.tagValue('d')

	emptyEvent.content = ''
	emptyEvent.tags = dTag ? [['d', dTag], ['deleted']] : [['deleted']]
	// TODO: Improve relay event reception. Retry publishing if just one relay receives the event
	const publishedEmptyEvent = await publishEvent(emptyEvent)
	if (!publishedEmptyEvent) return null

	return await publishedEmptyEvent.delete(reason, publish)
}
