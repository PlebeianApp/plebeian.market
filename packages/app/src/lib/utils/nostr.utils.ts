import type { NDKEvent } from '@nostr-dev-kit/ndk'

export async function publishEvent(event: NDKEvent) {
	if (import.meta.env.VITEST) {
		await event.sign()
	} else {
		await event.publish()
	}
}
