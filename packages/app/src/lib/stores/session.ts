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

type BaseAccount = {
	hexPubKey: string
	type: 'NIP07' | 'NSEC' | 'NIP46'
	lastLogged: number
	relays: string[]
}

type Nip07Account = BaseAccount & {
	type: 'NIP07'
}

type NsecAccount = BaseAccount & {
	type: 'NSEC'
	cSk: string
}

type Nip46Account = BaseAccount & {
	type: 'NIP46'
}

type Account = Nip07Account | NsecAccount | Nip46Account

export async function addAccount(account: Account) {
	return await sessions.accounts.add(account)
}

export async function getAccount(hexPubKey: string): Promise<Account | undefined> {
	return await sessions.accounts.get({ hexPubKey: hexPubKey })
}

export async function updateAccount(hexPubKey: string, updates: Partial<Account>): Promise<void> {
	await sessions.accounts.update(hexPubKey, updates)
}

export async function deleteAccount(hexPubKey: string): Promise<void> {
	await sessions.accounts.where('hexPubKey').equals(hexPubKey).delete()
}
