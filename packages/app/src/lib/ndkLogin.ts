import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { BaseAccount } from '$lib/stores/session'
import { NDKNip07Signer, NDKNip46Signer, NDKPrivateKeySigner, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { error } from '@sveltejs/kit'
import { HEX_KEYS_REGEX, KindsRelays } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { addAccount, getAccount, updateAccount } from '$lib/stores/session'
import { bytesToHex, checkIfUserExists, createNcryptSec, getUserRole, hexToBytes, resolveQuery, shouldRegister } from '$lib/utils'
import { nsecEncode } from 'nostr-tools/nip19'
import { decrypt } from 'nostr-tools/nip49'
import { get, writable } from 'svelte/store'

import type { UserRoles } from '@plebeian/database'

import type { ExistsResult } from './interfaces'
import { userEventSchema } from '../schema/nostr-events'
import { createRequest, queryClient } from './fetch/client'
import { createProductsByFilterQuery } from './fetch/products.queries'
import { userKeys } from './fetch/query-key-factory'
import { createStallsByFilterQuery } from './fetch/stalls.queries'
import { createUserFromNostrMutation } from './fetch/users.mutations'
import { processQueuedInsertions } from './nostrSubs/data-aggregator'
import { dmKind04Sub } from './nostrSubs/subs'
import { manageUserRelays } from './nostrSubs/userRelayManager'
import { cart } from './stores/cart'
import { getAppSettings, setupNDKSigner, unNullify } from './utils/login.utils'

export const NOSTR_CONNECT_KEY = 'nostr_connect_url'
export const NOSTR_LOCAL_SIGNER_KEY = 'local_signer'

type LoginResult = Promise<boolean>

export type NostrConnectParams = {
	signer: NDKPrivateKeySigner
	bunkerUrl: string
	localPrivateKey: string
	autoLogin?: boolean
}

export const isSuccessfulLogin = writable(false)
export const currentUserRole = writable<UserRoles>('pleb')
export const login = async (loginMethod: BaseAccount['type'], formData?: FormData, autoLogin?: boolean): LoginResult => {
	if (autoLogin) localStorage.setItem('auto_login', 'true')

	if (loginMethod === 'NIP07') return loginWithExtension()

	if (loginMethod === 'NSEC' && formData) {
		const key = HEX_KEYS_REGEX.test(formData.get('key') as string)
			? nsecEncode(hexToBytes(formData.get('key') as string))
			: (formData.get('key') as string)
		return loginWithPrivateKey(key, formData.get('password') as string)
	}

	return false
}

export const loginWithNostrConnect = async (params: NostrConnectParams): LoginResult => {
	localStorage.setItem(NOSTR_CONNECT_KEY, params.bunkerUrl)
	localStorage.setItem(NOSTR_LOCAL_SIGNER_KEY, params.localPrivateKey)
	try {
		await setupNDKSigner(params.signer)
		await fetchActiveUserData()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export const loginWithExtension = async (): LoginResult => {
	try {
		await setupNDKSigner(new NDKNip07Signer())
		await fetchActiveUserData()
		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

const handlePrivateKeyLogin = async (decryptedKey: Uint8Array | string, storeKey?: string): LoginResult => {
	const hexKey = typeof decryptedKey === 'string' ? decryptedKey : bytesToHex(decryptedKey)
	await setupNDKSigner(new NDKPrivateKeySigner(hexKey))
	await fetchActiveUserData(storeKey)
	return true
}

export const loginWithPrivateKey = async (key: string, password: string): LoginResult => {
	try {
		key = key.trim()
		if (key.startsWith('ncryptsec')) {
			return handlePrivateKeyLogin(decrypt(key, password), key)
		}
		if (key.startsWith('nsec')) {
			const { decodedSk, ncryptsec } = createNcryptSec(key, password)
			return handlePrivateKeyLogin(decodedSk, ncryptsec)
		}
		throw new Error('Unknown private format')
	} catch (e) {
		error(400, { message: String(e) })
	}
}

export const fetchActiveUserData = async (keyToLocalDb?: string): Promise<NDKUser | null> => {
	if (!ndk.signer) return null

	const user = await ndk.signer.user()
	await user.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })

	const userRelays = await ndk.fetchEvents({ authors: [user.pubkey], kinds: KindsRelays })
	if (userRelays.size) manageUserRelays(userRelays, 'add')
	ndkStore.set(ndk)

	const [userExists, allowRegister, userRole] = await Promise.all([
		checkIfUserExists(user.pubkey),
		getAppSettings(),
		getUserRole(user.pubkey),
		resolveQuery(() => createStallsByFilterQuery({ userId: user.pubkey }, true)),
		resolveQuery(() => createProductsByFilterQuery({ userId: user.pubkey }, true)),
	])
	currentUserRole.set(userRole)

	await loginLocalDb(user.pubkey, keyToLocalDb ? 'NSEC' : 'NIP07', keyToLocalDb)

	if (await shouldRegister(allowRegister, userExists)) {
		await loginDb(user, userExists)
	}

	return user
}

export const loginLocalDb = async (userPk: string, loginMethod: BaseAccount['type'], cSk?: string): LoginResult => {
	try {
		const pkExists = await getAccount(userPk)

		if (!pkExists) {
			const baseAccount = {
				hexPubKey: userPk,
				lastLogged: +new Date(),
			}

			await addAccount(loginMethod === 'NSEC' && cSk ? { ...baseAccount, type: 'NSEC', cSk } : { ...baseAccount, type: 'NIP07' })
		} else {
			await updateAccount(userPk, { lastLogged: +new Date() })
		}

		localStorage.setItem('last_account', userPk)
		return true
	} catch (e) {
		throw Error(JSON.stringify(e))
	}
}

export const loginDb = async (user: NDKUser, userExists: ExistsResult) => {
	try {
		const userProfile = unNullify({ id: user.pubkey, ...user.profile })

		if (!userExists.exists && !userExists.banned) {
			const body = userEventSchema.safeParse(userProfile)
			if (!body.success) throw Error(JSON.stringify(body.error))
			const userMutation = await get(createUserFromNostrMutation).mutateAsync({
				profile: body.data as NDKUserProfile,
				pubkey: user.pubkey,
			})

			if (userMutation) {
				await queryClient.setQueryData(userKeys.exists(user.pubkey), { exists: true, banned: false })
			}
			return
		}

		await createRequest(`PUT /api/v1/users/${user.pubkey}`, {
			auth: true,
			body: user.profile,
		})

		processQueuedInsertions(true)
	} catch (e) {
		throw Error(`Failed to login user to DB: ${e}`)
	}
}

export const logout = async () => {
	dmKind04Sub?.unref()
	localStorage.clear()
	cart.clear()
	location.replace('/')
}
