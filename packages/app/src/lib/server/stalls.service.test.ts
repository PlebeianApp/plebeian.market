import type { NDKKind } from '@nostr-dev-kit/ndk'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { createStall, getAllStalls, getStallById, getStallsByUserId, updateStall } from '$lib/server/stalls.service'
import { slugify } from '$lib/utils'
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
		const evContent = {
			id: createId(),
			name: 'Hello Stall',
			description: 'Hello Stall Description',
			currency: 'USD',
			quantity: 6,
			shipping: [
				{
					id: Math.random().toString(36).substring(2, 15),
					name: 'USPS',
					cost: Math.random() * 10,
					regions: ['US', 'CA'],
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: 30018 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [['d', `${slugify(evContent.name)}${createId()}`]],
		})
		await newEvent.sign(skSigner)
		const product = await createStall(newEvent)
		expect(product).toStrictEqual({
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
			kind: 30018 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [['d', `${slugify(evContent.name)}${createId()}`]],
		})

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
