import type { ZodError } from 'zod'
import Dexie from 'dexie'

class SessionDexie extends Dexie {
	accounts: Dexie.Table<Account, string>
	cachedEvents: Dexie.Table<CachedEvent, string>

	constructor() {
		super('plebeian.session')
		this.version(2).stores({
			accounts: 'hexPubKey, type, lastLogged, relays, cSk',
			cachedEvents: 'id, createdAt',
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
	relays: string[]
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

export async function cleanupCachedEvents(maxEntries: number = 1000, maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
	queueMicrotask(async () => {
		const now = Date.now()
		const allEvents = await sessions.cachedEvents.toArray()

		const eventsToRemove = allEvents.filter((event) => now - event.insertedAt > maxAgeMs || allEvents.length > maxEntries)

		if (eventsToRemove.length) {
			console.log('Cleaning cache', eventsToRemove)
			await sessions.cachedEvents.bulkDelete(eventsToRemove.map((event) => event.id))
		}
	})
}
