import type { VerifiedEvent } from 'nostr-tools'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { KindHttpAuth } from '$lib/constants'
import { verifyEvent } from 'nostr-tools'

import { db, eq, users } from '@plebeian/database'

// TODO Refactor this function to the new tables
export const isPubkeyAdmin = async (pubkey: string): Promise<boolean> => {
	const [adminUser] = await db.select().from(users).where(eq(users.id, pubkey)).execute()

	if (!adminUser) {
		return false
	} else if (adminUser.role === 'admin') {
		return true
	} else {
		return false
	}
}

export const decodeJwtToEvent = (jwt: string): VerifiedEvent => {
	const [nostr, token] = jwt.split(' ')
	if (nostr !== 'Nostr') {
		error(500, 'Invalid JWT')
	}

	const decoded = Buffer.from(token, 'base64').toString('utf8')
	const decodedJson = JSON.parse(decoded)

	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === KindHttpAuth)
		.safeParse(decodedJson)

	if (!verifiedEvent.success) {
		error(500, `Invalid JWT: ${JSON.stringify(verifiedEvent.error)}`)
	}

	return verifiedEvent.data
}
