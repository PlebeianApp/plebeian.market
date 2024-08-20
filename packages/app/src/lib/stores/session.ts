import type { ZodError } from 'zod'
import { deserialize, NDKEvent } from '@nostr-dev-kit/ndk'
import { db as ndkCache } from '@nostr-dev-kit/ndk-cache-dexie'
import { createQuery } from '@tanstack/svelte-query'
import { queryClient } from '$lib/fetch/client'
import Dexie from 'dexie'
import { get } from 'svelte/store'

import ndkStore from './ndk'

class SessionDexie extends Dexie {
	accounts: Dexie.Table<Account, string>
	cachedEvents: Dexie.Table<CachedEvent, string>

	constructor() {
		super('plebeian.session')
		this.version(2).stores({
			accounts: 'hexPubKey, type, lastLogged, cSk',
			cachedEvents: 'id, createdAt, insertedAt',
		})
		this.accounts = this.table('accounts')
		this.cachedEvents = this.table('cachedEvents')
	}
}

const sessions = new SessionDexie()
// Account types
export type BaseAccount = {
	hexPubKey: string
	type: 'NIP07' | 'NSEC' | 'NIP46'
	lastLogged: number
}

type Nip07Account = BaseAccount & {
	type: 'NIP07'
}

export type NsecAccount = BaseAccount & {
	type: 'NSEC'
	cSk: string
}

type Nip46Account = BaseAccount & {
	type: 'NIP46'
}

type Account = Nip07Account | NsecAccount | Nip46Account

// Cached Events type
export type CachedEvent = {
	id: string
	createdAt: number
	insertedAt: number
	kind: number
	pubkey: string
	data: unknown
	parseError: ZodError | null
}

// Account helper functions
export async function addAccount(account: Account) {
	try {
		const result = await sessions.accounts.add(account)
		result && console.log('Account added to indexDB', account)
	} catch (error) {
		if (error instanceof Dexie.DexieError) {
			console.warn(error.message)
		} else {
			throw error
		}
	}
}

export async function getAccount(hexPubKey: string): Promise<Account | undefined> {
	return await sessions.accounts.get({ hexPubKey: hexPubKey })
}

export async function getAllAccounts(): Promise<Account[] | undefined> {
	return await sessions.accounts.toArray()
}

export async function updateAccount(hexPubKey: string, updates: Partial<Account>): Promise<void> {
	await sessions.accounts.update(hexPubKey, updates)
}

export async function deleteAccount(hexPubKey: string): Promise<void> {
	await sessions.accounts.where('hexPubKey').equals(hexPubKey).delete()
}

// Helper functions for cached events
export async function getCachedEvent(id: string): Promise<CachedEvent | undefined> {
	return await sessions.cachedEvents.get(id)
}

export async function addCachedEvent(event: CachedEvent): Promise<void> {
	try {
		await sessions.cachedEvents.put(event)
	} catch (error) {
		if (error instanceof Dexie.DexieError) {
			console.warn(error.message)
		} else {
			throw error
		}
	}
}

export async function updateCachedEvent(id: string, updates: Partial<CachedEvent>): Promise<void> {
	await sessions.cachedEvents.update(id, updates)
}

export async function deleteCachedEvent(id: string): Promise<void> {
	await sessions.cachedEvents.where('id').equals(id).delete()
}

export function cleanupCachedEvents(maxEntries: number = 1000, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
	queueMicrotask(async () => {
		try {
			const now = Date.now()
			const cutoffDate = now - maxAgeMs

			const oldEventsDeleted = await sessions.cachedEvents.where('insertedAt').below(cutoffDate).delete()

			if (oldEventsDeleted > 0) {
				console.log(`Deleted ${oldEventsDeleted} old events (inserted before ${new Date(cutoffDate)})`)
			}

			const count = await sessions.cachedEvents.count()

			if (count > maxEntries) {
				const numberOfItemsToRemove = count - maxEntries
				const oldestItems = await sessions.cachedEvents.orderBy('insertedAt').limit(numberOfItemsToRemove).primaryKeys()

				await sessions.cachedEvents.bulkDelete(oldestItems)
				console.log(`Deleted ${oldestItems.length} oldest events to maintain max of ${maxEntries} entries`)
			}
		} catch (error) {
			console.error('Error during cache cleanup:', error)
		}
	})
}

// NDK Cache handler
interface EventQueryParams {
	userId: string
	kinds: number[]
}

export function useCachedEventsByUserIdAndKind({ userId, kinds }: EventQueryParams) {
	return createQuery<Set<NDKEvent>, Error>(
		{
			queryKey: ['cachedEvents', userId, ...kinds],
			queryFn: async (): Promise<Set<NDKEvent>> => {
				const events = await ndkCache.events
					.where('kind')
					.anyOf(kinds)
					.filter((event) => event.pubkey === userId)
					.reverse()
					.toArray()

				const latestEventMap = new Map<number, NDKEvent>()

				for (const event of events) {
					if (!latestEventMap.has(event.kind)) {
						const ndkEvent = new NDKEvent(get(ndkStore), deserialize(event.event))
						latestEventMap.set(event.kind, ndkEvent)
					}
				}

				return new Set(latestEventMap.values())
			},
			staleTime: 1000 * 60 * 10,
		},
		queryClient,
	)
}
