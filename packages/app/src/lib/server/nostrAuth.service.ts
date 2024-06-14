import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { VerifiedEvent } from 'nostr-tools'
import { NSchema as n } from '@nostrify/nostrify'
import { error } from '@sveltejs/kit'
import { KindHttpAuth } from '$lib/constants'
import { verifyEvent } from 'nostr-tools'

import { and, db, eq, USER_META, userMeta } from '@plebeian/database'

export const isPubkeyAdmin = async (pubkey: string): Promise<boolean> => {
	const [adminUser] = await db
		.select({
			valueText: userMeta.valueText,
		})
		.from(userMeta)
		.where(and(eq(userMeta.userId, pubkey), eq(userMeta.metaName, USER_META.ROLE.value)))
		.execute()

	return adminUser?.valueText === 'admin'
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
		.refine((val: NDKEvent) => val.kind === KindHttpAuth)
		.safeParse(decodedJson)

	if (!verifiedEvent.success) {
		error(500, `Invalid JWT: ${JSON.stringify(verifiedEvent.error)}`)
	}

	return verifiedEvent.data
}
