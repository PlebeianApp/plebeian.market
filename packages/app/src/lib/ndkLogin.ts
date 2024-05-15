import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { BaseAccount } from '$lib/stores/session'
import { bytesToHex } from './utils'
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { ndk, ndkActiveUser } from '$lib/stores/ndk'
import { addAccount, getAccount, updateAccount } from '$lib/stores/session'
import { getPublicKey } from 'nostr-tools'
import { decode } from 'nostr-tools/nip19'
import { decrypt, encrypt } from 'nostr-tools/nip49'

export async function fetchActiveUserData(): Promise<NDKUserProfile | null> {
	if (!ndk.signer) return null

const user = await ndk.signer.user()
	return user.fetchProfile()
}

export async function loginWithExtension(): Promise<boolean> {
	try {
		const signer = new NDKNip07Signer()
		console.log('Waiting for NIP-07 signer')
		await signer.blockUntilReady()
		const user = await signer.user()
		ndkActiveUser.set(user)
		await loginLocalDb(user.pubkey, 'NIP07')
		await fetchActiveUserData()
		await loginDb(user)
		return true
	} catch (error) {
		console.error(error)
		return false
	}
}

export async function loginWithPrivateKey(key: string, password: string): Promise<boolean> {
	if (key.startsWith('ncryptsec')) {
		try {
			const decryptedKey = decrypt(key, password)
			ndk.signer = new NDKPrivateKeySigner(bytesToHex(decryptedKey))
			await ndk.signer.blockUntilReady()
			const user = await ndk.signer.user()
			ndkActiveUser.set(user)
			const pk = getPublicKey(decryptedKey)
			await loginLocalDb(pk, 'NSEC', key)
			await fetchActiveUserData()
			await loginDb(user)
		} catch (e) {
			throw Error(JSON.stringify(e))
		}
	} else if (key.startsWith('nsec')) {
		try {
			const decoded = decode(key)
			if (decoded.type !== 'nsec') throw new Error('Not nsec')
			const cSK = encrypt(decoded.data, password)
			ndk.signer = new NDKPrivateKeySigner(bytesToHex(decoded.data))
			await ndk.signer.blockUntilReady()
			const user = await ndk.signer.user()
			ndkActiveUser.set(user)
			const pk = getPublicKey(decoded.data)
			await loginLocalDb(pk, 'NSEC', cSK)
			await fetchActiveUserData()
			await loginDb(user)
		} catch (e) {
			throw Error(JSON.stringify(e))
		}
	} else throw new Error('Unknown private format')

	await fetchActiveUserData()
	return true
}

export async function logout() {
	localStorage.clear()
	location.reload()
}

export async function loginLocalDb(userPk: string, loginMethod: BaseAccount['type'], cSk?: string): Promise<boolean> {
	try {
		const pkExist = await getAccount(userPk)
		if (!pkExist) {
			if (loginMethod == 'NIP07') {
				await addAccount({
					hexPubKey: userPk,
					lastLogged: +new Date(),
					relays: [],
					type: 'NIP07',
				})
			} else if (loginMethod == 'NSEC' && cSk) {
				await addAccount({
					hexPubKey: userPk,
					lastLogged: +new Date(),
					relays: [],
					type: 'NSEC',
					cSk: cSk,
				})
			}
		} else {
			await updateAccount(userPk, { lastLogged: +new Date() })
		}
		localStorage.setItem('last_account', userPk)
		localStorage.setItem('auto_login', 'true')
		return true
	} catch (e) {
		throw Error(JSON.stringify(e))
	}
}
// TODO: Keep iterating over this
export async function loginDb(user: NDKUser) {
	const response = await fetch(`/api/v1/users/${user.pubkey}`)
	if (response.ok) {
		console.log('updating user')
		const PUT = await fetch(`/api/v1/users/${user.pubkey}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user.profile),
		}).then((r) => r.json())
		console.log(PUT)
	} else {
		console.log('creating user')
		const POST = await fetch('/api/v1/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: user.pubkey,
				...user.profile,
			}),
		}).then((r) => r.json())
		console.log(POST)
	}
}
