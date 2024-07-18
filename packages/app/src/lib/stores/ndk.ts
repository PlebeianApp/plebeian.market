import type { NDKCacheAdapter, NostrEvent } from '@nostr-dev-kit/ndk'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie'
import NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import { type NostrSigner } from '@nostrify/nostrify'
import { writable } from 'svelte/store'

let cacheAdapter: NDKCacheAdapter | undefined = undefined

if (typeof window !== 'undefined') {
	cacheAdapter = new NDKCacheAdapterDexie({
		dbName: 'plebeian.ndk.v0',
	})
}

export const defaulRelaysUrls: string[] = [
	// 'wss://purplepag.es',
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://bouncer.nostree.me',
	'wss://nostr.land/',
	'wss://relay.damus.io',
	'wss://nostr.mom',
	'wss://nostr.wine',
	// 'wss://purplerelay.com/',
]

export const ndk: NDKSvelte = new NDKSvelte({
	explicitRelayUrls: defaulRelaysUrls,
	cacheAdapter,
})

ndk.connect().then(() => console.log('ndk connected successfully'))

const ndkStore = writable(ndk)

export class NostrifyNDKSigner implements NostrSigner {
	private ndk: NDKSvelte

	constructor(ndk: NDKSvelte) {
		this.ndk = ndk
	}

	async getPublicKey(): Promise<string> {
		const pubkey = this.ndk.activeUser?.pubkey
		if (!pubkey) {
			throw new Error('Unable to get public key')
		}
		return pubkey
	}

	async signEvent(event: NostrEvent): Promise<NostrEvent> {
		const ndkEvent = new NDKEvent(this.ndk, event)

		await ndkEvent.sign()

		return ndkEvent.toNostrEvent()
	}
}

export default ndkStore
