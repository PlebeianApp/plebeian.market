import type { NDKUser } from '@nostr-dev-kit/ndk'
import type { BaseAccount } from '$lib/stores/session'
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { GETUserFromId, POSTUser, PUTUser } from '$lib/apiUtils'
import { HEX_KEYS_REGEX } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { addAccount, getAccount, updateAccount } from '$lib/stores/session'
import { bytesToHex, hexToBytes } from '$lib/utils'
import { decode, nsecEncode } from 'nostr-tools/nip19'
import { decrypt, encrypt } from 'nostr-tools/nip49'

export async function fetchActiveUserData(): Promise<NDKUser | null> {
	if (!ndk.signer) return null
	const user = await ndk.signer.user()
	await user.fetchProfile()
	ndkStore.set(ndk)
	return user
}

export async function loginWithExtension(): Promise<boolean> {
	try {
		const signer = new NDKNip07Signer()
		console.trace('Waiting for NIP-07 signer')
		await signer.blockUntilReady()
		await signer.user()
		ndk.signer = signer
		ndkStore.set(ndk)
		const user = await fetchActiveUserData()
		if (user) {
			await loginLocalDb(user.pubkey, 'NIP07')
			await loginDb(user)
			return true
		}
		return false
	} catch (error) {
		console.error(error)
		return false
	}
}

export async function loginWithPrivateKey(key: string, password: string): Promise<boolean> {
	if (key.startsWith('ncryptsec')) {
		try {
			const decryptedKey = decrypt(key, password)
			const signer = new NDKPrivateKeySigner(bytesToHex(decryptedKey))
			console.log('Waiting for PrivateKey signer')
			await signer.blockUntilReady()
			await signer.user()
			ndk.signer = signer
			ndkStore.set(ndk)
			const user = await fetchActiveUserData()
			if (user) {
				await loginLocalDb(user.pubkey, 'NSEC', key)
				await loginDb(user)
				return true
			}
			return false
		} catch (e) {
			throw Error(JSON.stringify(e))
		}
	} else if (key.startsWith('nsec')) {
		try {
			const decoded = decode(key)
			if (decoded.type !== 'nsec') throw new Error('Not nsec')
			const cSK = encrypt(decoded.data, password)
			const signer = new NDKPrivateKeySigner(bytesToHex(decoded.data))
			console.log('Waiting for PrivateKey signer')
			await signer.blockUntilReady()
			await signer.user()
			ndk.signer = signer
			ndkStore.set(ndk)
			const user = await fetchActiveUserData()
			if (user) {
				await loginLocalDb(user.pubkey, 'NSEC', cSK)
				await loginDb(user)
				return true
			}
			return false
		} catch (e) {
			throw Error(JSON.stringify(e))
		}
	} else throw new Error('Unknown private format')
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
		return true
	} catch (e) {
		throw Error(JSON.stringify(e))
	}
}

export async function loginDb(user: NDKUser) {
	const response = await GETUserFromId(user.pubkey)
	if (response.ok) {
		console.log('updating user')
		const PUT = await PUTUser(user)
		console.log(PUT)
	} else {
		console.log('creating user')
		const POST = await POSTUser(user)
		console.log(POST)
	}
}

export async function login(loginMethod: BaseAccount['type'], formData?: FormData, autoLogin?: boolean): Promise<boolean> {
	if (loginMethod === 'NIP07') {
		try {
			if (autoLogin) {
				localStorage.setItem('auto_login', 'true')
			}
			return await loginWithExtension()
		} catch (e) {
			console.log(JSON.stringify(e))
			return false
		}
	} else if (loginMethod === 'NSEC' && formData) {
		const key = HEX_KEYS_REGEX.test(formData.get('key') as string)
			? nsecEncode(hexToBytes(formData.get('key') as string))
			: (formData.get('key') as string)
		const password = formData.get('password') as string
		try {
			if (autoLogin) {
				localStorage.setItem('auto_login', 'true')
			}
			return await loginWithPrivateKey(key, password)
		} catch (e) {
			console.log(JSON.stringify(e))
			return false
		}
	}
	return false
}
