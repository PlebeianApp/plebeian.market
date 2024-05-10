import { bytesToHex } from '@noble/hashes/utils'
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { ndk } from '$lib/stores/ndk'
import { addAccount, getAccount, updateAccount } from '$lib/stores/session'
import { getPublicKey } from 'nostr-tools'
import { decode } from 'nostr-tools/nip19'
import { decrypt, encrypt } from 'nostr-tools/nip49'

export async function fetchActiveUserData() {
	if (!ndk.signer) return
	const user = await ndk.signer.user()
	await user.fetchProfile()
	console.log('Fetched user', user)
}

export async function loginWithExtension(): Promise<boolean> {
	try {
		const signer = new NDKNip07Signer()
		console.log('Waiting for NIP-07 signer')
		await signer.blockUntilReady()
		const user = await signer.user()
		ndk.signer = signer
		await fetchActiveUserData()
		await addAccount({
			hexPubKey: user.pubkey,
			lastLogged: +new Date(),
			relays: user.relayUrls,
			type: 'NIP07',
		})
		localStorage.setItem('last_account', user.pubkey)
		localStorage.setItem('auto_login', 'true')
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

			const pk = getPublicKey(decryptedKey)
			const pkExist = await getAccount(pk)
			if (!pkExist) {
				await addAccount({
					hexPubKey: pk,
					lastLogged: +new Date(),
					relays: [],
					type: 'NSEC',
					cSk: key,
				})
			} else {
				await updateAccount(pk, { cSk: key })
			}
		} catch (e) {
			throw Error(JSON.stringify(e))
		}
	} else if (key.startsWith('nsec')) {
		console.log('hello')
		try {
			const decoded = decode(key)
			if (decoded.type !== 'nsec') throw new Error('Not nsec')

			const cSK = encrypt(decoded.data, password)
			ndk.signer = new NDKPrivateKeySigner(bytesToHex(decoded.data))

			await ndk.signer.blockUntilReady()

			const pk = getPublicKey(decoded.data)
			const pkExist = await getAccount(pk)
			if (!pkExist) {
				await addAccount({
					hexPubKey: pk,
					lastLogged: +new Date(),
					relays: [],
					type: 'NSEC',
					cSk: cSK,
				})
			} else {
				await updateAccount(pk, { cSk: cSK })
			}
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
