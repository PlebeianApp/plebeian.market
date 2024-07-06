import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { BaseAccount } from '$lib/stores/session'
import { NDKNip07Signer, NDKPrivateKeySigner, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { error } from '@sveltejs/kit'
import { invalidateAll } from '$app/navigation'
import { page } from '$app/stores'
import { HEX_KEYS_REGEX } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { addAccount, getAccount, updateAccount } from '$lib/stores/session'
import { bytesToHex, checkIfUserExists, createNcryptSec, hexToBytes } from '$lib/utils'
import { nsecEncode } from 'nostr-tools/nip19'
import { decrypt } from 'nostr-tools/nip49'
import { FetchError } from 'ofetch'
import { get } from 'svelte/store'

import { userEventSchema } from '../schema/nostr-events'
import { createRequest } from './fetch/client'

function unNullify<T extends object>(obj: T): T {
	return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)) as unknown as T
}

async function getAppSettings(): Promise<boolean> {
	return new Promise((resolve) => {
		async function check() {
			const {
				data: { appSettings },
			} = get(page)
			appSettings?.allowRegister ? resolve(appSettings.allowRegister) : setTimeout(check, 20)
		}
		check()
	})
}

export async function fetchActiveUserData(keyToLocalDb?: string): Promise<NDKUser | null> {
	if (!ndk.signer) return null
	console.log('Fetching profile')
	const user = await ndk.signer.user()
	await user.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
	ndkStore.set(ndk)
	if (keyToLocalDb) {
		await loginLocalDb(user.pubkey, 'NSEC', keyToLocalDb)
	} else {
		await loginLocalDb(user.pubkey, 'NIP07')
	}
	const userExists = await checkIfUserExists(user.pubkey)
	const allowRegister = await getAppSettings()
	if (userExists || (!userExists && allowRegister)) {
		console.log('Registering user in db')
		await loginDb(user)
	}
	invalidateAll()
	return user
}

export async function loginWithExtension(): Promise<boolean> {
	try {
		const signer = new NDKNip07Signer()
		console.log('Waiting for NIP-07 signer')
		await signer.blockUntilReady()
		ndk.signer = signer
		ndkStore.set(ndk)
		fetchActiveUserData()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export async function loginWithPrivateKey(key: string, password: string): Promise<boolean> {
	try {
		if (key.startsWith('ncryptsec')) {
			try {
				const decryptedKey = decrypt(key, password)
				const signer = new NDKPrivateKeySigner(bytesToHex(decryptedKey))
				console.log('Waiting for PrivateKey signer')
				await signer.blockUntilReady()
				ndk.signer = signer
				ndkStore.set(ndk)
				fetchActiveUserData(key)
				return true
			} catch (e) {
				throw new Error(`Error during loging with private key: ${e}`)
			}
		} else if (key.startsWith('nsec')) {
			try {
				const { decodedSk, ncryptsec } = createNcryptSec(key, password)
				key = bytesToHex(decodedSk)
				const signer = new NDKPrivateKeySigner(key)
				console.log('Waiting for PrivateKey signer')
				await signer.blockUntilReady()
				ndk.signer = signer
				ndkStore.set(ndk)
				fetchActiveUserData(ncryptsec)
				return true
			} catch (e) {
				throw new Error(`Error during loging with private key: ${e}`)
			}
		} else throw new Error('Unknown private format')
	} catch (e) {
		error(400, { message: `${e}` })
	}
}

export async function logout() {
	localStorage.clear()
	location.reload()
}

export async function loginLocalDb(userPk: string, loginMethod: BaseAccount['type'], cSk?: string): Promise<boolean> {
	try {
		const pkExists = await getAccount(userPk)
		if (!pkExists) {
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
	try {
		await createRequest(`GET /api/v1/users/${user.pubkey}`, {})

		console.log('updating user')
		await createRequest(`PUT /api/v1/users/${user.pubkey}`, {
			auth: true,
			body: user.profile,
		})
	} catch (e) {
		if (e instanceof FetchError) {
			if (e.status === 404) {
				console.log('creating user')
				const body: { id: string } & NDKUserProfile = userEventSchema.parse(unNullify({ id: user.pubkey, ...user.profile }))
				await createRequest('POST /api/v1/users/', {
					auth: true,
					body: body,
				})
			}
		}
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
