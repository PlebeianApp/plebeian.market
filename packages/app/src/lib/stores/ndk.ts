import { defaulRelaysUrls } from '$lib/constants'
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

export const relayBlackList: string[] = []

export const ndk: NDKSvelte = new NDKSvelte({
	explicitRelayUrls: defaulRelaysUrls,
	blacklistRelayUrls: relayBlackList,
	enableOutboxModel: true,
	autoConnectUserRelays: true,
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
