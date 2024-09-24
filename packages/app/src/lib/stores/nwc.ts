import type { NDKNwcResponse } from '@nostr-dev-kit/ndk'
import type { DisplayWallet } from '$lib/server/wallet.service'
import { NDKNwc } from '@nostr-dev-kit/ndk'
import { createWalletBalanceQuery } from '$lib/fetch/wallets.queries'
import { EncryptedStorage, resolveQuery } from '$lib/utils'
import { derived, get, writable } from 'svelte/store'

import ndkStore from './ndk'

const NWC_TIMEOUT = 2500
const MAX_RETRIES = 3

type NWCWallet = {
	nwc: NDKNwc
	id: string
	balance: number
}

const ndkNWCs = writable<NWCWallet[]>([])

export const balanceOfWorkingNWCs = derived(ndkNWCs, ($ndkNWCs) => $ndkNWCs.reduce((total, wallet) => total + wallet.balance, 0) / 1000)

async function initializeNdkNWCs(): Promise<NWCWallet[]> {
	const $ndk = get(ndkStore)
	if (!$ndk.activeUser || !$ndk.signer) return []

	const pubkey = $ndk.activeUser.pubkey
	console.log('Initializing NWCs...', `nwc-wallets:${pubkey}`)

	const storedWallets = localStorage.getItem(`nwc-wallets:${pubkey}`)
	if (!storedWallets) {
		console.log('No NWC wallets found in local storage')
		return []
	}

	const encryptedStorage = new EncryptedStorage($ndk.signer)
	const nwcWalletsString = await encryptedStorage.getItem('nwc-wallets')
	if (!nwcWalletsString) {
		console.log('No encrypted NWC wallets found')
		return []
	}

	const localWallets = JSON.parse(nwcWalletsString) as Record<string, DisplayWallet['walletDetails']>

	const initializeWallet = async ([id, walletDetails]: [string, DisplayWallet['walletDetails']]): Promise<NWCWallet | null> => {
		const nwc = new NDKNwc({
			ndk: $ndk,
			pubkey: walletDetails.walletPubKey,
			relayUrls: walletDetails.walletRelays,
			secret: walletDetails.walletSecret,
		})

		try {
			await Promise.race([
				nwc.blockUntilReady(NWC_TIMEOUT),
				new Promise((_, reject) => setTimeout(() => reject(new Error('NWC initialization timeout')), NWC_TIMEOUT)),
			])
			const balance = await getBalanceWithTimeout(nwc, id, NWC_TIMEOUT)
			return { nwc, id, balance }
		} catch (error) {
			console.error(`Error initializing NWC ${id}:`, error)
			return null
		}
	}

	const nwcs = await Promise.all(Object.entries(localWallets).map(initializeWallet))
	return nwcs.filter((wallet): wallet is NWCWallet => wallet !== null)
}
async function getBalanceWithTimeout(nwc: NDKNwc, walletId: string, timeout: number): Promise<number> {
	try {
		const balancePromise = await resolveQuery(() => createWalletBalanceQuery(nwc, walletId), timeout)
		return balancePromise ?? 0
	} catch (error) {
		console.error('Error getting balance:', error)
		return 0
	}
}

export async function payInvoiceWithNWC(invoice: string, amountSats: number): Promise<NDKNwcResponse<{ preimage: string }>> {
	let retries = 0

	const tryPayInvoice = async (): Promise<NDKNwcResponse<{ preimage: string }>> => {
		const currentNWCs = get(ndkNWCs)
		const suitableWallet = currentNWCs.find((wallet) => wallet.balance >= amountSats * 1000 + 10000)

		if (!suitableWallet) {
			if (retries < MAX_RETRIES) {
				retries++
				console.log(`No suitable wallet found. Retrying (${retries}/${MAX_RETRIES})...`)
				await initNdkNWCs()
				return tryPayInvoice()
			}
			throw new Error('No suitable NWC wallet available for this payment')
		}

		console.log(`Attempting payment with wallet ID: ${suitableWallet.id}`)
		try {
			const result = (await suitableWallet.nwc.payInvoice(invoice)) as NDKNwcResponse<{ preimage: string }>
			if (result.error) {
				console.error(`Payment failed with wallet ${suitableWallet.id}:`, result.error)
				throw new Error(`Payment failed with wallet ${suitableWallet.id}: ${result.error}`)
			}
			return result
		} catch (error) {
			console.error(`Error during payment with wallet ${suitableWallet.id}:`, error)
			throw error
		}
	}

	return tryPayInvoice()
}

export async function updateBalanceOfWorkingNWCs() {
	const currentNWCs = get(ndkNWCs)
	const updatedNWCs = await Promise.all(
		currentNWCs.map(async (wallet) => ({
			...wallet,
			balance: await getBalanceWithTimeout(wallet.nwc, wallet.id, NWC_TIMEOUT),
		})),
	)
	ndkNWCs.set(updatedNWCs)
}

export async function initNdkNWCs() {
	const nwcs = await initializeNdkNWCs()
	ndkNWCs.set(nwcs)
}

export function canPayWithNWC(amountSats: number): boolean {
	// We add 10000 msats, or 10 sats to ensure that the wallet can pay fees
	return get(ndkNWCs).some((wallet) => wallet.balance >= amountSats * 1000 + 10000)
}
