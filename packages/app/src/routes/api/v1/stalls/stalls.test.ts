import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts } from '$lib/constants'
import { unixTimeNow } from '$lib/utils'
import { describe, expect, it } from 'vitest'

import { createId, devUser1, shipping } from '@plebeian/database'

describe('/stalls', () => {
	it('GET', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls`).then((response) => response.json())

		expect(result.stalls.length).toBeGreaterThan(0)
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

		expect(result.stalls).toHaveLength(15)
	})

	it('POST', async () => {
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const identifier = createId()
		const evContent = {
			id: `${KindProducts}:${devUser1.pk}:${identifier}`,
			name: 'Hello Stall',
			description: 'Hello Stall Description from api',
			currency: 'USD',
			quantity: 6,
			shipping: [
				{
					id: createId(),
					name: 'USPS',
					cost: '21.21',
					regions: ['USA', 'CAN'],
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: 30017 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: unixTimeNow(),
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

		expect(result).toBeTruthy()
	})

	it('GET stalls by user id', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls?userId=${devUser1.pk}`).then(
			(response) => response.json(),
		)

		expect(result.stalls.length).toBeTruthy()
	})
})
