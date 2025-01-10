import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { NDKKind, NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { browser } from '$app/environment'
import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { derived, get } from 'svelte/store'

import type { AppSettings } from '@plebeian/database'

const ndk = browser ? get(ndkStore) : undefined

let appSettings: AppSettings

if (typeof window !== 'undefined') {
	page.subscribe((page) => {
		if (page.data) {
			appSettings = page.data.appSettings
		}
	})
}

export const stallsSub: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined = ndk?.storeSubscribe(
	{ kinds: [KindStalls], limit: 100 },
	{ closeOnEose: true, autoStart: false, cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY },
)

export const dmKind04Sub: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined = ndk?.storeSubscribe(
	{},
	{ closeOnEose: false, autoStart: false },
)

export const groupedDMs = derived(dmKind04Sub ?? [], ($dmKind04Sub) => {
	const groups: Record<string, NDKEvent[]> = {}
	const activeUser = get(ndkStore).activeUser

	for (const event of $dmKind04Sub) {
		let pubkey: string

		if (event.pubkey === activeUser?.pubkey) {
			const recipient = event.tagValue('p')
			if (!recipient) continue
			pubkey = recipient
		} else {
			pubkey = event.pubkey
		}

		if (!groups[pubkey]) {
			groups[pubkey] = []
		}
		groups[pubkey].push(event)
	}

	for (const pubkey in groups) {
		groups[pubkey].sort((a, b) => Number(b.created_at) - Number(a.created_at))
	}

	return groups
})

const HISTORY_LIMIT = 100

interface DMSubscriptionManager {
	loadConversationHistory: (contactPubkey: string) => void
}

export function createDMSubscriptionManager(dmKind04Sub: NDKEventStore<ExtendedBaseType<NDKEvent>>): DMSubscriptionManager {
	function createConversationFilters(userPubkey: string, contactPubkey: string): NDKFilter[] {
		return [
			{
				kinds: [NDKKind.EncryptedDirectMessage],
				authors: [userPubkey],
				'#p': [contactPubkey],
				limit: HISTORY_LIMIT,
			},
			{
				kinds: [NDKKind.EncryptedDirectMessage],
				authors: [contactPubkey],
				'#p': [userPubkey],
				limit: HISTORY_LIMIT,
			},
		]
	}

	function mergeFilters(existingFilters: NDKFilter[], newFilters: NDKFilter[]): NDKFilter[] {
		const filterMap = new Map<string, NDKFilter>()

		const createFilterKey = (filter: NDKFilter): string => {
			const authors = filter.authors?.sort().join(',') || ''
			const tags = filter['#p']?.sort().join(',') || ''
			return `${authors}-${tags}`
		}

		;[...existingFilters, ...newFilters].forEach((filter) => {
			const key = createFilterKey(filter)
			const existing = filterMap.get(key)

			filterMap.set(
				key,
				existing
					? {
							...filter,
							limit: Math.max(filter.limit || 0, existing.limit || 0),
						}
					: filter,
			)
		})

		return Array.from(filterMap.values())
	}

	return {
		loadConversationHistory(contactPubkey: string) {
			const userPubkey = get(ndkStore).activeUser?.pubkey
			if (!userPubkey) return

			const currentFilters = dmKind04Sub.filters || []
			const conversationFilters = createConversationFilters(userPubkey, contactPubkey)
			const mergedFilters = mergeFilters(currentFilters, conversationFilters)

			dmKind04Sub.changeFilters(mergedFilters)
			dmKind04Sub.ref()
		},
	}
}
