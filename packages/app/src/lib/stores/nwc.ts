import type { NDKNwcResponse } from '@nostr-dev-kit/ndk'
import type { DisplayWallet } from '$lib/server/wallet.service'
import { NDKNwc } from '@nostr-dev-kit/ndk'
import { createWalletBalanceQuery } from '$lib/fetch/wallets.queries'
import { resolveQuery } from '$lib/utils'
import { get, writable } from 'svelte/store'

import $ndkStore from './ndk'

export const NWC_TIMEOUT = 5000

let ndkNWCs: { nwc: NDKNwc; id: string }[] = []

export const balanceOfWorkingNWCs = writable<number>(0)

async function initializeNdkNWCs(): Promise<{ nwc: NDKNwc; id: string }[]> {
	const $ndk = get($ndkStore)
	if (!$ndk.activeUser) return []

	console.log('Initializing NWCs...', `nwc-wallets-${$ndk.activeUser.pubkey}`)

	const nwcWalletsString = localStorage.getItem(`nwc-wallets-${$ndk.activeUser.pubkey}`)
	const localWallets = nwcWalletsString ? (JSON.parse(nwcWalletsString) as Record<string, DisplayWallet['walletDetails']>) : {}

	const nwcs = Object.entries(localWallets).map(([id, walletDetails]) => ({
		nwc: new NDKNwc({
			ndk: $ndk,
			pubkey: walletDetails.walletPubKey,
			relayUrls: walletDetails.walletRelays,
			secret: walletDetails.walletSecret,
		}),
		id,
	}))

	await Promise.all(
		nwcs.map(async ({ nwc }) => {
			try {
				await Promise.race([
					nwc.blockUntilReady(NWC_TIMEOUT),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), NWC_TIMEOUT)),
				])
			} catch (error) {
				console.error('Error initializing NWC:', error)
			}
		}),
	)

	return nwcs
}

export function setupNdkStoreListener() {
	return $ndkStore.subscribe(async ($ndk) => {
		if ($ndk.activeUser) {
			console.log('NDK store changed, reinitializing NWCs...')
			ndkNWCs = await initializeNdkNWCs()
			updateBalanceOfWorkingNWCs()
		}
	})
}

export const getMainNWCWallet = () => {
	let retries = 0
	const maxRetries = 3

	const tryGetWallet = async (): Promise<NDKNwc | null> => {
		if (ndkNWCs.length === 0 && retries < maxRetries) {
			retries++
			console.log(`Attempting to initialize NWCs (attempt ${retries}/${maxRetries})`)
			await initNdkNWCs()
			return tryGetWallet()
		}

		return ndkNWCs[0]?.nwc || null
	}

	return tryGetWallet()
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

export async function payInvoiceWithFirstWorkingNWC(invoice: string): Promise<NDKNwcResponse<{ preimage: string }>> {
	const maxRetries = 3
	let retries = 0

	const tryPayInvoice = async (): Promise<NDKNwcResponse<{ preimage: string }>> => {
		if (ndkNWCs.length === 0) {
			if (retries < maxRetries) {
				retries++
				console.log(`Payment attempt failed. Retrying (${retries}/${maxRetries})...`)
				await initNdkNWCs()
				return tryPayInvoice()
			}
			throw new Error('No NWCs available')
		}
		return (await ndkNWCs[0].nwc.payInvoice(invoice)) as NDKNwcResponse<{ preimage: string }>
	}

	return tryPayInvoice()
}

async function updateBalanceOfWorkingNWCs() {
	const balances = await Promise.all(ndkNWCs.map(({ nwc, id }) => getBalanceWithTimeout(nwc, id, NWC_TIMEOUT)))
	console.log('Balances:', balances)
	const totalBalance = balances.reduce((sum, balance) => sum + balance, 0)
	balanceOfWorkingNWCs.set(totalBalance / 1000)
}

export async function initNdkNWCs() {
	ndkNWCs = await initializeNdkNWCs()
	updateBalanceOfWorkingNWCs()
}
