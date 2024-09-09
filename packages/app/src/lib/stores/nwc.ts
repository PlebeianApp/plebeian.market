import type { NDKNwcResponse } from '@nostr-dev-kit/ndk'
import type { DisplayWallet } from '$lib/server/wallet.service'
import { NDKNwc } from '@nostr-dev-kit/ndk'
import { derived, get, writable } from 'svelte/store'

import $ndkStore from './ndk'

export const NWC_TIMEOUT = 5000

export const initializeNdkNWCs = async () => {
	const $ndk = get($ndkStore)

	if (!$ndk.activeUser) {
		return []
	}

	console.log('Initializing NWCs...', `nwc-wallets-${$ndk.activeUser.pubkey}`)

	const nwcWalletsString = localStorage.getItem(`nwc-wallets-${$ndk.activeUser.pubkey}`)
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
					await nwc.blockUntilReady(NWC_TIMEOUT),
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

export function setupNdkStoreListener() {
	return $ndkStore.subscribe(async ($ndk) => {
		if ($ndk) {
			console.log('NDK store changed, reinitializing NWCs...')
			const initializedNWCs = await initializeNdkNWCs()
			ndkNWCs.set(initializedNWCs)
			updateBalanceOfWorkingNWCs()
		}
	})
}

export const ndkNWCs = writable<NDKNwc[]>([])

// TODO: what is the users favourite wallet?

export const getMainNWCWallet = derived(ndkNWCs, ($ndkNWCs) => {
	let retries = 0
	const maxRetries = 3

	const tryGetWallet = async (): Promise<NDKNwc | null> => {
		const targetWallet = $ndkNWCs[0]

		if (!targetWallet && retries < maxRetries) {
			retries++
			console.log(`Attempting to initialize NWCs (attempt ${retries}/${maxRetries})`)
			await initNdkNWCs()
			return tryGetWallet()
		}

		return targetWallet || null
	}

	return tryGetWallet()
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
	const maxRetries = 3
	let retries = 0

	const tryPayInvoice = async (): Promise<NDKNwcResponse<{ preimage: string }>> => {
		try {
			const nwcs = get(ndkNWCs)
			if (nwcs.length === 0) {
				throw new Error('No NWCs available')
			}
			return (await nwcs[0].payInvoice(invoice)) as NDKNwcResponse<{ preimage: string }>
		} catch (error) {
			if (retries < maxRetries - 1) {
				retries++
				console.log(`Payment attempt failed. Retrying (${retries}/${maxRetries})...`)
				await initNdkNWCs()
				return tryPayInvoice()
			} else {
				throw error
			}
		}
	}

	return tryPayInvoice()
}

export function updateBalanceOfWorkingNWCs() {
	ndkNWCs.subscribe(async ($ndkNWCs) => {
		const balancePromises = $ndkNWCs.map((nwc) => getBalanceWithTimeout(nwc, NWC_TIMEOUT))
		const balances = await Promise.all(balancePromises)

		console.log('Balances:', balances)

		const totalBalance = balances.reduce((sum, balance) => sum + balance, 0)
		balanceOfWorkingNWCs.set(totalBalance / 1000)
	})
}

export const initNdkNWCs = async () => {
	const initializedNWCs = await initializeNdkNWCs()
	ndkNWCs.set(initializedNWCs)
	updateBalanceOfWorkingNWCs()
}
