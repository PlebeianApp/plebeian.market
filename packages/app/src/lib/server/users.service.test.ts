import type { NostrEvent } from '@nostr-dev-kit/ndk'
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { createUser, getAllUsers, getUserById, updateUser } from '$lib/server/users.service'
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { describe, expect, it } from 'vitest'

import { devUser1 } from '@plebeian/database'

describe('users service', () => {
	it('returns list of users', async () => {
		const res = await getAllUsers()
		expect(res.length).toBeGreaterThan(0)
	})

	it('returns user by id', async () => {
		const res = await getUserById(devUser1.pk)
		expect(res.id).toBe(devUser1.pk)
	})

	it('creates a user', async () => {
		const newUserSkArr = generateSecretKey()
		const newUserPk = getPublicKey(newUserSkArr)
		const newUserSk = Buffer.from(newUserSkArr).toString('hex')
		const skSigner = new NDKPrivateKeySigner(newUserSk)
		const evContent = {
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
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: NDKKind.Metadata,
			pubkey: newUserPk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [],
		}) as NostrEvent

		const res = await createUser(newEvent)
		expect(res).toBeDefined()
		expect(res.id).toBe(newUserPk)
	})

	it('updates a user', async () => {
		const targetUser = await getUserById(devUser1.pk)
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const userUpdate = {
			about: 'Software Developer with Experience',
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: NDKKind.Metadata,
			pubkey: targetUser.id,
			content: JSON.stringify(userUpdate),
			created_at: Math.floor(Date.now() / 1000),
			tags: [],
		}) as NostrEvent

		const res = await updateUser(targetUser.id, newEvent)
		expect(res).toBeDefined()
		expect(res.about).toBe('Software Developer with Experience')
	})
})
