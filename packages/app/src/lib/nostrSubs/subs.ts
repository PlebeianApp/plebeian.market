import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { NDKKind } from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { derived, get } from 'svelte/store'

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
	{ kinds: [KindStalls], limit: 50 },
	{ closeOnEose: true, autoStart: false },
)

export const dmKind04Sub: NDKEventStore<ExtendedBaseType<NDKEvent>> = ndk.storeSubscribe({}, { closeOnEose: true, autoStart: false })

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

	// Sort messages within each group by timestamp
	// for (const pubkey in groups) {
	// 	groups[pubkey].sort((a, b) => (a.created_at || 0) - (b.created_at || 0))
	// }

	return groups
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

	// Sort messages within each group by timestamp
	// for (const pubkey in groups) {
	// 	groups[pubkey].sort((a, b) => (a.created_at || 0) - (b.created_at || 0))
	// }

	return groups
})
