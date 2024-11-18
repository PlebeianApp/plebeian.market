import type { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import type { VerifiedEvent } from 'nostr-tools'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { verifyEvent } from 'nostr-tools'

import { db, users } from '@plebeian/database'

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
	if (!authorExists.exists) {
		const [newUser] = await db.insert(users).values({ id: pubkey }).returning()
		if (!newUser.id) {
			error(500, 'Failed to insert user')
		}
		return !!newUser.id
	}
	return authorExists.exists
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
