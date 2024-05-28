import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import type { VerifiedEvent } from 'nostr-tools'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { getEventCoordinates, isPReplacEvent } from '$lib/utils'
import { verifyEvent } from 'nostr-tools'

import type { InferSelectModel } from '@plebeian/database'
import { db, eq, events, users } from '@plebeian/database'

export const verifyEventBody = async (event: Request, kind: NDKKind): Promise<VerifiedEvent> => {
	const body = await event.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val: NostrEvent) => val.kind === kind)
		.safeParse(body)
	if (!verifiedEvent.success) {
		error(400, `Invalid nostr Event: ${JSON.stringify(verifiedEvent.error)}`)
	}
	return verifiedEvent.data
}

export const ensureAuthorExists = async (pubkey: string): Promise<string> => {
	const [authorExists] = await db.select().from(users).where(eq(users.id, pubkey)).execute()
	if (!authorExists.id) {
		const [newUser] = await db.insert(users).values({ id: pubkey }).returning()
		if (!newUser.id) {
			error(500, 'Failed to insert user')
		}
		return newUser.id
	}
	return authorExists.id
}

export const persistEvent = async (event: VerifiedEvent): Promise<void> => {
	await ensureAuthorExists(event.pubkey)
	const eventTargetId: string = isPReplacEvent(event.kind) ? getEventCoordinates(event).coordinates : event.id
	type Event = InferSelectModel<typeof events>
	const eventExists = (await db.select().from(events).where(eq(events.id, eventTargetId)).execute()) as unknown as Event
	const eventResult = await (eventExists
		? db
				.update(events)
				.set({ event: JSON.stringify(event) })
				.where(eq(events.id, eventTargetId))
				.returning()
		: db
				.insert(events)
				.values({ id: eventTargetId, kind: event.kind, event: JSON.stringify(event), author: event.pubkey })
				.returning())

	if (!eventResult) {
		error(500, 'Failed to persist event')
	}
}

export const verifyAndPersistRawEvent = async (event: Request, kind: NDKKind): Promise<NostrEvent> => {
	const verifiedEvent = await verifyEventBody(event, kind)
	await persistEvent(verifiedEvent)
	return verifiedEvent
}
