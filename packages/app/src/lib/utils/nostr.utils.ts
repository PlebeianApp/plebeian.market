import type { NDKEvent } from '@nostr-dev-kit/ndk'

export async function publishEvent(event: NDKEvent): Promise<boolean> {
	try {
		if (import.meta.env.VITEST) {
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
