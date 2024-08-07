import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import type { VerifiedEvent } from 'nostr-tools'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { getEventCoordinates, isPReplacEvent } from '$lib/utils'
import { verifyEvent } from 'nostr-tools'

import { db, eq, events, inArray, sql, users } from '@plebeian/database'

import { userExists, usersExists } from './users.service'

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

export const ensureAuthorExists = async (pubkey: string): Promise<boolean> => {
	const authorExists = await userExists(pubkey)
	if (!authorExists) {
		const [newUser] = await db.insert(users).values({ id: pubkey }).returning()
		if (!newUser.id) {
			error(500, 'Failed to insert user')
		}
		return !!newUser.id
	}
	return authorExists
}

export const ensureAuthorsExists = async (pubkeys: string[]): Promise<{ id: string }[]> => {
	const nonExistingAuthors = await usersExists(pubkeys)
	if (nonExistingAuthors.length === 0) {
		return []
	}
	const nonExistingAuthorsToInsert = nonExistingAuthors.map((pubkey) => ({ id: pubkey }))
	const insertedAuthors = await db.insert(users).values(nonExistingAuthorsToInsert).returning()

	if (insertedAuthors.length !== nonExistingAuthors.length) {
		error(500, 'Failed to insert users')
	}

	return insertedAuthors
}

export const persistEvent = async (event: NostrEvent): Promise<NostrEvent | undefined> => {
	await ensureAuthorExists(event.pubkey)
	const eventTargetId: string = isPReplacEvent(event.kind as number)
		? (getEventCoordinates(event)?.coordinates as string)
		: (event.id as string)
	const eventExists = await db
		.select({ id: sql`1` })
		.from(events)
		.where(eq(events.id, eventTargetId))
		.limit(1)
		.execute()
	try {
		const eventResult = await (eventExists.length > 0
			? db
					.update(events)
					.set({ event: JSON.stringify(event) })
					.where(eq(events.id, eventTargetId))
					.returning()
			: db
					.insert(events)
					.values({ id: eventTargetId, kind: event.kind as number, event: JSON.stringify(event), author: event.pubkey })
					.returning())

		if (!eventResult) {
			error(500, 'Failed to persist event')
		}
		return event
	} catch (e) {
		console.log(e)
	}
}

export const eventsExists = async (nostrEvents: NostrEvent[], persist: boolean = false): Promise<NostrEvent[]> => {
	if (!nostrEvents || nostrEvents.length === 0) {
		throw new Error('NostrEvents array is empty or null')
	}

	const eventCoordinatesCache = new WeakMap()

	const getEventCoordinatesCached = (event: NostrEvent) =>
		eventCoordinatesCache.has(event)
			? eventCoordinatesCache.get(event)
			: eventCoordinatesCache.set(event, getEventCoordinates(event)).get(event)

	const eventCoordinates = nostrEvents.map((event) => getEventCoordinatesCached(event).coordinates) as string[]

	const existingEvents = await db
		.select({ id: sql`1` })
		.from(events)
		.where(inArray(events.id, eventCoordinates))

	const existingEventCoordinates = existingEvents.map(
		(_) =>
			getEventCoordinatesCached(nostrEvents.find((event) => eventCoordinates.includes(getEventCoordinatesCached(event).coordinates))!)
				.coordinates,
	)

	const nonExistingEvents = nostrEvents.filter((event) => !existingEventCoordinates.includes(getEventCoordinatesCached(event).coordinates))
	const eventsAuthors = nonExistingEvents.map((event) => event.pubkey)
	await ensureAuthorsExists(eventsAuthors)

	const eventsToInsert = nonExistingEvents.map((event) => ({
		id: getEventCoordinatesCached(event).coordinates,
		kind: event.kind!,
		event: JSON.stringify(event),
		author: event.pubkey,
	}))

	if (persist) {
		try {
			await db
				.insert(events)
				.values(eventsToInsert)
				.onConflictDoUpdate({
					target: events.id,
					set: {
						updatedAt: sql`excluded.created_at`,
						event: sql`excluded.event`,
					},
				})
				.returning()
			console.log(`Inserted ${nonExistingEvents.length} new events into the database`)
		} catch (e) {
			error(500, `Error inserting events, ${JSON.stringify(e)}`)
		}
	}

	return nonExistingEvents
}

export const verifyAndPersistRawEvent = async (event: Request, kind: NDKKind): Promise<NostrEvent> => {
	const verifiedEvent = await verifyEventBody(event, kind)
	await persistEvent(verifiedEvent)
	return verifiedEvent
}
