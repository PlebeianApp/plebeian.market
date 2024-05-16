import Dexie from 'dexie'

class SessionDexie extends Dexie {
	accounts: Dexie.Table<Account, string> // Account is the type of your account object

	constructor() {
		super('plebeian.session')
		this.version(1).stores({
			accounts: 'hexPubKey, type, lastLogged, relays, cSk',
		})
		this.accounts = this.table('accounts')
	}
}

const sessions = new SessionDexie()

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
