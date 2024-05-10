import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { getEventCoordinates, isPReplacEvent } from '$lib/utils'
import { verifyEvent } from 'nostr-tools'

import type { InferSelectModel } from '@plebeian/database'
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
		if (!newUser[0].id) {
			error(500, 'Failed to insert user')
		}
		targetId = newUser[0].id
	}

	let eventResult
	const isPReplaceableEvent = isPReplacEvent(verifiedEvent.data.kind)
	const eventTargetId = isPReplaceableEvent ? getEventCoordinates(verifiedEvent.data).coordinates : verifiedEvent.data.id
	type Event = InferSelectModel<typeof events>
	const eventExists = (await db.select().from(events).where(eq(events.id, eventTargetId)).execute()) as unknown as Event

	if (!isPReplaceableEvent || !eventExists.id) {
		eventResult = await db
			.insert(events)
			.values({
				id: eventTargetId,
				kind: verifiedEvent.data.kind,
				event: JSON.stringify(verifiedEvent.data),
				author: targetId,
			})
			.returning()
	} else {
		eventResult = await db
			.update(events)
			.set({
				event: JSON.stringify(verifiedEvent.data),
			})
			.where(eq(events.id, eventTargetId))
			.returning()
	}

	if (!eventResult) {
		error(500, 'Failed to insert event')
	}

	return verifiedEvent.data
}
