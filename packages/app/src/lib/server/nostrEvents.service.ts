import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { verifyEvent } from 'nostr-tools'

import { db, events } from '@plebeian/database'

export const verifyAndPersistRawEvent = async (event: Request, kind: NDKKind): Promise<NostrEvent> => {
	const body = await event.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === kind)
		.safeParse(body)

	if (!verifiedEvent.success) {
		error(400, `Invalid nostr Event: ${JSON.stringify(verifiedEvent.error)}`)
	}

	const insertEventResult = await db
		.insert(events)
		.values({
			id: verifiedEvent.data.id,
			kind: verifiedEvent.data.kind,
			event: JSON.stringify(verifiedEvent.data),
			author: verifiedEvent.data.pubkey,
		})
		.execute()

	if (!insertEventResult) {
		error(500, 'Failed to insert event')
	}

	return verifiedEvent.data
}
