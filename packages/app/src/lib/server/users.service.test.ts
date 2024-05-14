import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import { bytesToHex } from '@noble/hashes/utils'
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { createUser, getAllUsers, getUserById, updateUser } from '$lib/server/users.service'
import { generateSecretKey } from 'nostr-tools/pure'
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
		const skSigner = new NDKPrivateKeySigner(bytesToHex(newUserSkArr))
		await skSigner.blockUntilReady()
		const user = await skSigner.user()
		user.profile = {
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

		const res = await createUser(user)
		expect(res).toBeDefined()
		expect(res.id).toBe(user.pubkey)
	})

	it('updates a user', async () => {
		const targetUser = await getUserById(devUser1.pk)
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		await skSigner.blockUntilReady()
		const user = await skSigner.user()

		user.profile = {
			...user.profile,
			about: 'Software Developer with Experience',
		} as NDKUserProfile

		const res = await updateUser(targetUser.id, user)
		expect(res).toBeDefined()
		expect(res.about).toBe('Software Developer with Experience')
	})
})
