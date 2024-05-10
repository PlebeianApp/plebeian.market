import type { NDKCacheAdapter, NDKUser } from '@nostr-dev-kit/ndk'
import { NDKNip07Signer } from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie'
import NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import { writable } from 'svelte/store'

import { addAccount } from './session'

let cacheAdapter: NDKCacheAdapter | undefined = undefined

if (typeof window !== 'undefined') {
	cacheAdapter = new NDKCacheAdapterDexie({
		dbName: 'plebeian.ndk.v0',
	})
}

export const defaulRelaysUrls: string[] = [
	'wss://purplepag.es',
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://bouncer.nostree.me',
	'wss://nostr.land/',
	'wss://purplerelay.com/',
]

export const ndk: NDKSvelte = new NDKSvelte({
	explicitRelayUrls: defaulRelaysUrls,
	cacheAdapter,
})

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

ndk.connect().then(() => console.log('ndk connected successfully'))

const ndkStore = writable(ndk)

export default ndkStore
