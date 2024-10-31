import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { Readable } from 'svelte/store'
import { groupedDMs } from '$lib/nostrSubs/subs'
import ndkStore from '$lib/stores/ndk'
import { derived, get, writable } from 'svelte/store'

const STORAGE_KEY = 'chatLastRead' as const

interface LastReadMessages {
	[pubkey: string]: number
}

interface ChatNotificationStore extends Readable<LastReadMessages> {
	setLastRead: (pubkey: string, timestamp: number) => void
	markAllRead: (pubkey: string) => void
	markAllConversationsRead: () => void
}

function createChatNotificationStore(): ChatNotificationStore {
	// Add error handling for localStorage
	const loadInitialState = (): LastReadMessages => {
		if (typeof window === 'undefined') return {}
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			return stored ? JSON.parse(stored) : {}
		} catch {
			console.warn('Failed to load chat read status')
			return {}
		}
	}

	const { subscribe, set, update } = writable<LastReadMessages>(loadInitialState())

	// Debounce localStorage updates
	let saveTimeout: ReturnType<typeof setTimeout> | null = null
	const debouncedSave = (value: LastReadMessages) => {
		if (typeof window === 'undefined') return

		if (saveTimeout) clearTimeout(saveTimeout)
		saveTimeout = setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
			} catch (error) {
				console.warn('Failed to save chat read status:', error)
			}
		}, 1000)
	}

	subscribe(debouncedSave)

	return {
		subscribe,
		setLastRead: (pubkey: string, timestamp: number) => {
			update((state) => ({ ...state, [pubkey]: timestamp }))
		},
		markAllRead: (pubkey: string) => {
			const messages = get(groupedDMs)[pubkey] || []
			if (messages.length > 0) {
				const latestTimestamp = Math.max(...messages.map((m) => Number(m.created_at)))
				update((state) => ({ ...state, [pubkey]: latestTimestamp }))
			}
		},
		markAllConversationsRead: () => {
			const conversations = get(groupedDMs)
			const newState: LastReadMessages = {}

			Object.entries(conversations).forEach(([pubkey, messages]) => {
				if (messages.length > 0) {
					newState[pubkey] = Math.max(...messages.map((m) => Number(m.created_at)))
				}
			})

			set(newState)
		},
	}
}

export const chatNotifications = createChatNotificationStore()

function isNDKEventArray(value: unknown): value is NDKEvent[] {
	return Array.isArray(value) && value.every((item) => item && typeof item === 'object' && 'created_at' in item && 'pubkey' in item)
}

export const unreadCounts = derived([groupedDMs, chatNotifications], ([$groupedDMs, $chatNotifications]) => {
	const activeUser = get(ndkStore).activeUser
	if (!activeUser?.pubkey) return {}

	const counts: Record<string, number> = {}

	Object.entries($groupedDMs).forEach(([pubkey, messages]) => {
		if (!isNDKEventArray(messages)) return

		const lastReadTime = $chatNotifications[pubkey] || 0
		counts[pubkey] = messages.filter((msg) => Number(msg.created_at) > lastReadTime && msg.pubkey !== activeUser.pubkey).length
	})

	return counts
})
