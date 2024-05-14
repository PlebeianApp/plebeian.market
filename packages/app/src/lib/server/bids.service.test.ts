import type { NostrEvent } from 'nostr-tools'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindBids } from '$lib/constants'
import { describe, expect, it } from 'vitest'

import { devUser1 } from '@plebeian/database'

import { getAllAuctions } from './auctions.service'
import { createBid, getBidsByAuctionId, getBidsByUserId } from './bids.service'

describe('bids service', () => {
	it('gets bids by user id', async () => {
		const userId = devUser1.pk
		const bids = await getBidsByUserId(userId)

		expect(Array.isArray(bids)).toBe(true)

		for (const bid of bids) {
			expect(bid).toHaveProperty('id')
			expect(bid).toHaveProperty('userId', userId)
		}
	})

	it('gets bids by auction id', async () => {
		const [auction] = await getAllAuctions()
		const bids = await getBidsByAuctionId(auction.id)

		expect(Array.isArray(bids)).toBe(true)

		for (const bid of bids) {
			expect(bid).toHaveProperty('id')
			expect(bid).toHaveProperty('auctionId', auction.id)
		}
	})

	it('creates a bid', async () => {
		const [auction] = await getAllAuctions()
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const evContent = 123
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindBids,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [['e', `${auction.id}`]],
		})
		await newEvent.sign(skSigner)
		const bid = await createBid(auction.id, newEvent as NostrEvent)
		expect(bid).toEqual({
			auctionId: expect.any(String),
			bidAmount: 123,
			bidStatus: 'pending',
			createdAt: expect.any(Date),
			id: expect.any(String),
			updatedAt: expect.any(Date),
			userId: devUser1.pk,
		})
	})
})
