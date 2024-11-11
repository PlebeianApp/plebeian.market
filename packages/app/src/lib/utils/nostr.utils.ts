import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
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
