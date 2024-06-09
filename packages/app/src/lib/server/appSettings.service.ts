import type { NostrEvent } from '@nostr-dev-kit/ndk'
import { error } from '@sveltejs/kit'

import type { AppSettings, Bid } from '@plebeian/database'
import { appSettings, bids, db, eq } from '@plebeian/database'

import { bidEventSchema } from '../../schema/nostr-events'

export type DisplayBid = Pick<Bid, 'id' | 'auctionId' | 'bidAmount' | 'bidStatus' | 'userId' | 'createdAt'>

export const getAppSettings = async (): Promise<AppSettings> => {
	const [appResult] = await db.select().from(appSettings).execute()

	if (!appResult) {
		error(404, 'Not found')
	}

	return appResult
}
