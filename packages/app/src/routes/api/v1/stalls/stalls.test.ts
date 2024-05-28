import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts } from '$lib/constants'
import { describe, expect, it } from 'vitest'

import { createId, devUser1 } from '@plebeian/database'

describe('/stalls', () => {
	it('GET', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls`).then((response) => response.json())

		expect(result).toHaveLength(10)
	})

	it('GET with filter', async () => {
		const routeParams = {
			page: '1',
			pageSize: '15',
			order: 'desc',
			orderBy: 'createdAt',
		}

		const result = await fetch(
			`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls?${new URLSearchParams(routeParams)}`,
		).then((response) => response.json())

		expect(result).toHaveLength(15)
	})

	it('POST', async () => {
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
					id: Math.random().toString(36).substring(2, 15),
					name: 'USPS',
					cost: Math.random() * 10,
					regions: ['USA', 'CAN'],
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: 30017 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()),
			tags: [['d', identifier]],
		})

		await newEvent.sign(skSigner)
		const nostrEvent = await newEvent.toNostrEvent()

		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls`, {
			method: 'POST',
			body: JSON.stringify(nostrEvent),
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => response.json())

		expect(result).toStrictEqual({
			id: expect.any(String),
			createDate: expect.any(String),
			currency: 'USD',
			description: 'Hello Stall Description',
			name: 'Hello Stall',
			userId: '86a82cab18b293f53cbaaae8cdcbee3f7ec427fdf9f9c933db77800bb5ef38a0',
		})
	})

	it('GET stalls by user id', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls?userId=testUserId`).then((response) =>
			response.json(),
		)

		expect(result).toHaveLength(10)
	})
})
