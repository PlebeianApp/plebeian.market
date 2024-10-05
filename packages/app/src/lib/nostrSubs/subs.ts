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
		kinds: [NDKKind.EncryptedDirectMessage],
	},
	{ closeOnEose: false, autoStart: true },
)

export const groupedDMs = derived(dmKind04Sub, ($dmKind04Sub) => {
	const groups: Record<string, NDKEvent[]> = {}
	const activeUser = get(ndkStore).activeUser
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

export const activeUserDMs = derived(dmKind04Sub, ($dmKind04Sub) => {
	const groups: Record<string, NDKEvent[]> = {}
	const activeUser = get(ndkStore).activeUser
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
