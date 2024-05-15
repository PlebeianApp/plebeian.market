import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { describe, expect, it } from 'vitest'

describe('/users', () => {
	it('GET', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/users`).then((response) => response.json())

		expect(result.length).toBeGreaterThan(0)
	})

	it('GET with filter', async () => {
		const routeParams = {
			page: '1',
			pageSize: '5',
			order: 'desc',
			orderBy: 'createdAt',
		}

		const result = await fetch(
			`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/users?${new URLSearchParams(routeParams)}`,
		).then((response) => response.json())

		expect(result).toHaveLength(5)
	})

	it('POST', async () => {
		const newUserSkArr = generateSecretKey()
		const newUserSk = Buffer.from(newUserSkArr).toString('hex')
		const skSigner = new NDKPrivateKeySigner(newUserSk)
		await skSigner.blockUntilReady()
		const user = await skSigner.user()
		const userProfile = {
			id: user.pubkey,
			name: 'John Doe',
			about: 'Software Developer',
			picture: 'https://example.com/picture.jpg',
			banner: 'https://example.com/banner.jpg',
			nip05: 'NIP05 value',
			lud06: 'LUD06 value',
			lud16: 'LUD16 value',
			website: 'https://johndoe.com',
			zapService: 'Zap Service value',
			displayName: 'John',
			image: 'https://example.com/image.jpg',
		}

		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/users`, {
			method: 'POST',
			body: JSON.stringify(userProfile),
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => response.json())

		expect(result).toStrictEqual({
			about: 'Software Developer',
			banner: 'https://example.com/banner.jpg',
			createdAt: expect.any(String),
			displayName: 'John',
			id: user.pubkey,
			image: 'https://example.com/image.jpg',
			lastLogin: expect.any(String),
			lud06: 'LUD06 value',
			lud16: 'LUD16 value',
			name: 'John Doe',
			nip05: 'NIP05 value',
			role: 'pleb',
			trustLevel: 'reasonable',
			updatedAt: expect.any(String),
			website: 'https://johndoe.com',
			zapService: 'Zap Service value',
		})
	})
})
