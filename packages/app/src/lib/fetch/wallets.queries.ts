import type { NDKNwc } from '@nostr-dev-kit/ndk'
import type { DisplayWallet } from '$lib/server/wallet.service'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/wallets/?userId=${string}`]: Operation<string, 'GET', never, never, DisplayWallet[], never>
	}
}

export const userWalletQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['walletDetails', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`GET /api/v1/wallets/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})
			}
			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)

export const createWalletBalanceQuery = (nwc: NDKNwc, walletId: string) =>
	createQuery(
		{
			queryKey: ['wallet-balance', nwc.walletService.pubkey, walletId],
			queryFn: async () => {
				console.log('Getting balance for', walletId, nwc.relaySet.relayUrls)
				const balance = await nwc.getBalance()
				// TODO: Remove condicional conversion to msats when https://github.com/coinos/coinos-server/issues/65 is closed
				const balanceResult = balance.result?.balance
					? nwc.relaySet.relayUrls.includes('wss://relay.coinos.io/')
						? balance.result?.balance * 1000
						: balance.result?.balance
					: 0
				console.log(balanceResult)
				return balanceResult
			},
			staleTime: 1000 * 60 * 60,
		},
		queryClient,
	)
