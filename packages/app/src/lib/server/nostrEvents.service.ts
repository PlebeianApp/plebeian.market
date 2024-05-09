import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { verifyEvent } from 'nostr-tools'

import { db, eq, events, users } from '@plebeian/database'

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

	const authorExists = await db.select().from(users).where(eq(users.id, verifiedEvent.data.pubkey)).execute()

	let targetId = verifiedEvent.data.pubkey

	if (!authorExists[0].id) {
		const newUser = await db.insert(users).values({ id: verifiedEvent.data.pubkey }).returning()

		console.log('newUser:', newUser)
		if (!newUser[0].id) {
			error(500, `err 1 ${JSON.stringify(authorExists)} ---- ${newUser}`)
		}
		targetId = newUser[0].id
	}

	let insertEventResult

	try {
		insertEventResult = await db
			.insert(events)
			.values({
				id: verifiedEvent.data.id,
				kind: verifiedEvent.data.kind,
				event: JSON.stringify(verifiedEvent.data),
				author: targetId,
			})
			.execute()
	} catch (e) {
		error(500, `err 2 ${JSON.stringify(e)}`)
	}

	console.log('insertEventResult:', insertEventResult)

	if (!insertEventResult) {
		error(500, 'Failed to insert event')
	}

	return verifiedEvent.data
}
