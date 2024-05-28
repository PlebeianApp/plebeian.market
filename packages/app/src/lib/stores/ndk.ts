import type { NDKCacheAdapter } from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie'
import NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import { writable } from 'svelte/store'

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

ndk.connect().then(() => console.log('ndk connected successfully'))

const ndkStore = writable(ndk)

export default ndkStore
