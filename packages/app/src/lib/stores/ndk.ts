import type { NostrProvider } from '@getalby/lightning-tools'
import type { NDKCacheAdapter, NDKSigner, NostrEvent } from '@nostr-dev-kit/ndk'
import type { Event } from 'nostr-tools'
import { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie'
import NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import { type NostrSigner } from '@nostrify/nostrify'
import { defaulRelaysUrls } from '$lib/constants'
import { bytesToHex } from '$lib/utils'
import { generateSecretKey } from 'nostr-tools'
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

	async signEvent(event: NostrEvent): Promise<Event> {
		const ndkEvent = new NDKEvent(this.ndk, event)

		await ndkEvent.sign()

		return (await ndkEvent.toNostrEvent()) as Event
	}
}

export class GenericKeySigner implements NostrProvider {
	private ndk: NDKSvelte
	private signer: NDKSigner

	constructor(options?: { ndk?: NDKSvelte; privateKey?: string; isAnonymous?: boolean }) {
		this.ndk = options?.ndk ?? new NDKSvelte()

		if (options?.isAnonymous || !options?.ndk) {
			// Use ephemeral key for anonymous zaps or when no NDK instance is provided
			this.signer = new NDKPrivateKeySigner(options?.privateKey ?? bytesToHex(generateSecretKey()))
		} else {
			// Use the active NDK signer for authenticated zaps
			this.signer = this.ndk.signer!
		}
	}

	async getPublicKey(): Promise<string> {
		const pubkey = (await this.signer.user())?.pubkey
		if (!pubkey) {
			throw new Error('Unable to get public key')
		}
		return pubkey
	}

	async signEvent(event: Event): Promise<Event> {
		const ndkEvent = new NDKEvent(this.ndk, event)
		await ndkEvent.sign(this.signer)
		return (await ndkEvent.toNostrEvent()) as Event
	}
}

export default ndkStore
