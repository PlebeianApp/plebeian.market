import type { NDKCacheAdapter } from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie'
import NDKSvelte from '@nostr-dev-kit/ndk-svelte'

let cacheAdapter: NDKCacheAdapter | undefined = undefined

if (typeof window !== 'undefined') {
	cacheAdapter = new NDKCacheAdapterDexie({
		dbName: 'plebeian.v0',
	})
}

export const ndk: NDKSvelte = new NDKSvelte({
	explicitRelayUrls: ['wss://nostr.land/', 'wss://purplerelay.com/'],
	cacheAdapter,
})
