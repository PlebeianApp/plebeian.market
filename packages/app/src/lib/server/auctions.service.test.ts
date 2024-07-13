import type { NostrEvent } from 'nostr-tools'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindAuctionProduct } from '$lib/constants'
import { getStallsByUserId } from '$lib/server/stalls.service'
import { unixTimeNow } from '$lib/utils'
import { describe, expect, it } from 'vitest'

import { createId, devUser1 } from '@plebeian/database'

import { createAuction, getAllAuctions, getAuctionById, getAuctionsByStallId, getAuctionsByUserId, updateAuction } from './auctions.service'

describe('auctions service', () => {
	it('gets auctions by user id', async () => {
		const [auction] = await getAllAuctions()
		const userId = auction.userId
		const auctions = await getAuctionsByUserId(userId)

		expect(Array.isArray(auctions)).toBe(true)

		for (const auction of auctions) {
			expect(auction).toHaveProperty('id')
			expect(auction).toHaveProperty('userId', userId)
		}
	})

	it('gets auctions by stall id', async () => {
		const [stall] = await getStallsByUserId(devUser1.pk)
		const auctions = await getAuctionsByUserId(stall.id)

		expect(Array.isArray(auctions)).toBe(true)

		for (const auction of auctions) {
			expect(auction).toHaveProperty('id')
			expect(auction).toHaveProperty('stallId', stall.id)
		}
	})

	it('gets all auctions', async () => {
		const auctions = await getAllAuctions()

		expect(Array.isArray(auctions)).toBe(true)
	})

	it('gets auction by id', async () => {
		const auctions = await getAllAuctions()
		const auction = await getAuctionById(auctions[0].id)

		expect(auction).toHaveProperty('id', auctions[0].id)
	})

	it('creates a auction', async () => {
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const identifier = createId()
		const evContent = {
			stall_id: stall.id,
			name: 'Hello Auction',
			id: `${KindAuctionProduct}:${stall.userId}:${identifier}`,
			description: 'Hello Description',
			images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
			extraCost: '33',
			startPrice: 133,
			start_date: Math.floor(Date.now()),
			starting_bid: 100,
			duration: 60 * 60 * 24,
			specs: [
				['color', 'red'],
				['size', 'medium'],
			],
			shipping: [
				{
					id: Math.random().toString(36).substring(2, 15),
					cost: Math.random() * 10,
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindAuctionProduct,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: unixTimeNow(),
			tags: [['d', identifier]],
		})

		await newEvent.sign(skSigner)
		const auction = await createAuction(newEvent as NostrEvent, 'inactive')
		expect(auction).toStrictEqual({
			createdAt: expect.any(String),
			currency: stall.currency,
			description: 'Hello Description',
			endDate: expect.any(Date),
			extraCost: expect.any(Number),
			id: expect.any(String),
			identifier: identifier,
			productName: 'Hello Auction',
			stallId: stall.id,
			startDate: expect.any(Date),
			startingBidAmount: 100,
			status: 'inactive',
			quantity: 1,
			updatedAt: expect.any(Date),
			userId: devUser1.pk,
		})
	})

	it('updates a auction', async () => {
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const targetAuction = await getAuctionsByStallId(stall.id).then((auctions) => auctions[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const evContent = {
			id: targetAuction.id,
			stall_id: stall.id,
			name: 'Hello Auction changed',
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindAuctionProduct,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: unixTimeNow(),
			tags: [['d', targetAuction.id.split(':')[2]]],
		})

		const auction = await updateAuction(targetAuction.id, newEvent as NostrEvent)

		expect(auction).toEqual({
			id: targetAuction.id,
			createdAt: expect.any(String),
			currency: stall.currency,
			description: targetAuction.description,
			endDate: expect.any(Date),
			extraCost: 0,
			identifier: targetAuction.identifier,
			productName: 'Hello Auction changed',
			stallId: stall.id,
			startDate: expect.any(Date),
			startingBidAmount: '',
			status: 'inactive',
			quantity: 1,
			updatedAt: expect.any(Date),
			userId: stall.userId,
		})
	})
})
