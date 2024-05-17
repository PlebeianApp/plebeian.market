import type { NostrEvent } from '@nostr-dev-kit/ndk'
import { error } from '@sveltejs/kit'

import type { Bid } from '@plebeian/database'
import { bids, createId, db, eq } from '@plebeian/database'

import { bidEventSchema } from '../../schema/nostr-events'

export type DisplayBid = Pick<Bid, 'id' | 'auctionId' | 'bidAmount' | 'bidStatus' | 'userId' | 'createdAt'>

export const getBidById = async (bidId: string): Promise<DisplayBid> => {
	const [bidResult] = await db.select().from(bids).where(eq(bids.id, bidId)).execute()

	if (!bidResult) {
		error(404, 'Not found')
	}

	return bidResult
}

export const getBidsByUserId = async (userId: string): Promise<DisplayBid[]> => {
	const bidsResult = await db.select().from(bids).where(eq(bids.userId, userId)).execute()

	if (bidsResult) {
		return bidsResult
	}

	error(404, 'Not found')
}

export const getBidsByAuctionId = async (auctionId: string): Promise<DisplayBid[]> => {
	const bidsResult = await db.select().from(bids).where(eq(bids.auctionId, auctionId)).execute()

	if (bidsResult) {
		return bidsResult
	}

	error(404, 'Not found')
}

export const createBid = async (auctionId: string, bidEvent: NostrEvent): Promise<DisplayBid> => {
	const bidEventContent = JSON.parse(bidEvent.content)
	const parsedBid = bidEventSchema.parse(bidEventContent)

	const insertBid: Bid = {
		id: bidEvent.id!,
		createdAt: new Date(bidEvent.created_at! * 1000),
		updatedAt: new Date(bidEvent.created_at! * 1000),
		userId: bidEvent.pubkey,
		bidAmount: parsedBid.toString(),
		auctionId,
		bidStatus: 'pending',
	}

	const [bidResult] = await db.insert(bids).values(insertBid).returning()

	if (bidResult) {
		return bidResult
	}

	error(500, 'Failed to create bid')
}
