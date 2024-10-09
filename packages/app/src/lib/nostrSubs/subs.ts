import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { derived, get, writable } from 'svelte/store'

import type { AppSettings } from '@plebeian/database'

const ndk = get(ndkStore)

let appSettings: AppSettings

if (typeof window !== 'undefined') {
	page.subscribe((page) => {
		if (page.data) {
			appSettings = page.data.appSettings
		}
	})
}

export const stallsSub: NDKEventStore<ExtendedBaseType<NDKEvent>> = ndk.storeSubscribe(
	{ kinds: [KindStalls], limit: 100 },
	{ closeOnEose: true, autoStart: false },
)

export const dmKind04Sub: NDKEventStore<ExtendedBaseType<NDKEvent>> = ndk.storeSubscribe(
	{
		kinds: [],
	},
	{ closeOnEose: false, autoStart: false },
)

if (typeof window !== 'undefined') {
	ndkStore.subscribe(($ndkStore) => {
		if ($ndkStore.activeUser) {
			dmKind04Sub.changeFilters([
				{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, '#p': [$ndkStore.activeUser.pubkey] },
				{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, authors: [$ndkStore.activeUser.pubkey] },
			])
			dmKind04Sub.ref()
		}
	})
}

export const groupedDMs = derived([ndkStore, dmKind04Sub], ([$ndkStore, $dmKind04Sub]) => {
	const groups: Record<string, NDKEvent[]> = {}
	const activeUser = $ndkStore.activeUser
	for (const event of $dmKind04Sub) {
		if (event.pubkey === activeUser?.pubkey) continue
		const pubkey = event.pubkey
		if (!groups[pubkey]) {
			groups[pubkey] = []
		}
		groups[pubkey].push(event)
	}

	return groups
})

export const lastSeen = writable(typeof window !== 'undefined' ? Number(localStorage.getItem('last-seen')) ?? Date.now() : Date.now())

if (typeof window !== 'undefined') {
	lastSeen.subscribe(($lastSeen) => localStorage?.setItem('last-seen', `${$lastSeen}`))
}

export const unseenDMs = derived([lastSeen, groupedDMs], ([$lastSeen, $groupedDMs]) => {
	return Object.fromEntries(
		Object.entries($groupedDMs).filter(([_, events]) => {
			return Number(events[0].created_at) * 1000 > $lastSeen
		}),
	)
})

export const activeUserDMs = derived([ndkStore, dmKind04Sub], ([$ndkStore, $dmKind04Sub]) => {
	const groups: Record<string, NDKEvent[]> = {}
	const activeUser = $ndkStore.activeUser
	for (const event of $dmKind04Sub) {
		if (event.pubkey !== activeUser?.pubkey) continue
		const pubkey = event.tagValue('p')
		if (pubkey && !groups[pubkey]) {
			groups[pubkey] = []
		}
		if (pubkey) {
			groups[pubkey].push(event)
		}
	}

	return groups
})
