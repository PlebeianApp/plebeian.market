import type { DisplayWallet } from '$lib/server/wallet.service'
import { NDKNwc } from '@nostr-dev-kit/ndk'
import { derived, get, writable } from 'svelte/store'

import $ndkStore from './ndk'

const NWC_TIMEOUT = 5000

export const initializeNdkNWCs = async () => {
	const $ndk = get($ndkStore)

	if (!$ndk) return []

	const nwcWalletsString = localStorage.getItem('nwc-wallets')
	const localWallets = nwcWalletsString ? (JSON.parse(nwcWalletsString) as Record<string, DisplayWallet['walletDetails']>) : {}

	const nwcs = Object.entries(localWallets).map(([id, walletDetails]) => {
		return new NDKNwc({
			ndk: $ndk,
			pubkey: walletDetails.walletPubKey,
			relayUrls: walletDetails.walletRelays,
			secret: walletDetails.walletSecret,
		})
	})

	await Promise.all(
		nwcs.map(async (nwc) => {
			try {
				await Promise.race([
					await nwc.blockUntilReady(),
					new Promise((_, reject) => {
						setTimeout(() => reject(new Error('Timeout')), NWC_TIMEOUT)
					}),
				])
			} catch (error) {
				console.error('Error initializing NWC:', error)
			}
		}),
	)

	return nwcs
}

export const getNewInvoice = async () => {
	const invoice = await get(ndkNWCs)[0].sendReq('make_invoice', {
		amount: 25000,
		description: 'test NWC invoice',
		expiry: 213,
	})

	return invoice
}

export const ndkNWCs = writable<NDKNwc[]>([])

// TODO: what is the users favourite wallet?

export const getMainNWCWallet = derived(ndkNWCs, ($ndkNWCs) => {
	return $ndkNWCs[0]
})

export const balanceOfWorkingNWCs = writable<number>(0)

const getBalanceWithTimeout = async (nwc: NDKNwc, timeout: number): Promise<number> => {
	try {
		const balancePromise = nwc.getBalance()
		const timeoutPromise = new Promise<{ result: { balance: number } }>((_, reject) =>
			setTimeout(() => reject(new Error('Timeout')), timeout),
		)

		const result = await Promise.race([balancePromise, timeoutPromise])
		return result.result?.balance || 0
	} catch (error) {
		console.error('Error getting balance:', error)
		return 0
	}
}

export const payInvoiceWithFirstWorkingNWC = async (invoice: string) => {
	return await get(ndkNWCs)[0].payInvoice(invoice)
}

export function updateBalanceOfWorkingNWCs() {
	ndkNWCs.subscribe(async ($ndkNWCs) => {
		const balancePromises = $ndkNWCs.map((nwc) => getBalanceWithTimeout(nwc, NWC_TIMEOUT))
		const balances = await Promise.all(balancePromises)
		const totalBalance = balances.reduce((sum, balance) => sum + balance, 0)
		balanceOfWorkingNWCs.set(totalBalance / 1000)
	})
}

export const initNdkNWCs = async () => {
	const initializedNWCs = await initializeNdkNWCs()
	ndkNWCs.set(initializedNWCs)
	updateBalanceOfWorkingNWCs()
}
