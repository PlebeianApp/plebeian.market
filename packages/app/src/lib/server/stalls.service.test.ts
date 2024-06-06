import type { NostrEvent } from '@nostr-dev-kit/ndk'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts, KindStalls } from '$lib/constants'
import { createStall, getAllStalls, getStallById, getStallsByUserId, updateStall } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import { createId, devUser1 } from '@plebeian/database'

describe('stalls service', () => {
	it('gets stalls by user id', async () => {
		const userId = devUser1.pk

		const stalls = await getStallsByUserId(userId)

		expect(stalls.length).toBeGreaterThan(0)
	})

	it('gets stalls by stall id', async () => {
		const userId = devUser1.pk

		const stalls1 = await getStallsByUserId(userId)

		expect(stalls1.length).toBeGreaterThan(0)

		const stalls = await getStallById(stalls1[0].id)

		expect(stalls).toBeDefined()
	})

	it('gets all stalls', async () => {
		const stalls = await getAllStalls()

		expect(stalls.length).toBeGreaterThan(0)
	})

	it('gets stall by id', async () => {
		const stalls = await getAllStalls()

		const product = await getStallById(stalls[0].id)

		expect(product).toBeDefined()
	})

	it('creates a stalls', async () => {
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const identifier = createId()
		const evContent = {
			id: `${KindProducts}:${devUser1.pk}:${identifier}`,
			name: 'Hello Stall',
			description: 'Hello Stall Description',
			currency: 'USD',
			quantity: 6,
			shipping: [
				{
					id: createId(),
					name: 'USPS',
					baseCost: '21.21',
					regions: ['USA', 'CAN'],
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindStalls,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()) / 1000,
			tags: [['d', identifier]],
		})
		await newEvent.sign(skSigner)
		const stall = await createStall(newEvent as NostrEvent)
		expect(stall).toStrictEqual({
			id: expect.any(String),
			createDate: expect.any(String),
			currency: 'USD',
			description: 'Hello Stall Description',
			name: 'Hello Stall',
			userId: devUser1.pk,
		})
	})

	it('updates a stall', async () => {
		const targetStall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const evContent = {
			stall_id: targetStall.id,
			name: 'Hello Stall changed',
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindStalls,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()) / 1000,
			tags: [['d', targetStall.identifier]],
		}) as NostrEvent

		const product = await updateStall(targetStall.id, newEvent)

		expect(product).toStrictEqual({
			id: targetStall.id,
			createDate: expect.any(String),
			userId: targetStall.userId,
			currency: targetStall.currency,
			description: targetStall.description,
			name: 'Hello Stall changed',
		})
	})
})
