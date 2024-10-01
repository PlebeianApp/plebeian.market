import type { NDKNwc } from '@nostr-dev-kit/ndk'
import type { DisplayWallet } from '$lib/server/wallet.service'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/wallets/?userId=${string}`]: Operation<string, 'GET', never, never, DisplayWallet[], never>
		[k: `GET /api/v1/wallets/?userId=${string}&paymentDetailId=${string}`]: Operation<string, 'GET', never, never, { index: number }, never>
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
				return balance.result?.balance
			},
			staleTime: 1000 * 60 * 60,
		},
		queryClient,
	)
export const createOnChainIndexQuery = (userId: string, paymentDetailId: string) =>
	createQuery(
		{
			queryKey: ['onChainIndex', userId, paymentDetailId],
			queryFn: async () => {
				if (userId && paymentDetailId) {
					const response = await createRequest(`GET /api/v1/wallets/?userId=${userId}&paymentDetailId=${paymentDetailId}`, {
						auth: true,
					})
					return response.index
				}
				return null
			},
			enabled: !!userId && !!paymentDetailId,
		},
		queryClient,
	)
