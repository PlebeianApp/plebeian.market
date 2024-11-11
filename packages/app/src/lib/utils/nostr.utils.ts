import type { NDKEvent } from '@nostr-dev-kit/ndk'

export async function publishEvent(event: NDKEvent): Promise<boolean> {
	console.log('Publishing event:', import.meta.env)
	try {
		if (import.meta.env) {
			await event.sign()
		} else {
			// await event.publish()
		}
		return true
	} catch (error) {
		console.error('Error publishing event:', error)
		return false
	}
}
