import type { OnChainIndexWallet } from '$lib/server/wallet.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { WALLET_TYPE } from '@plebeian/database/constants'

import { createRequest, queryClient } from './client'

export type NWCWalletDTO = {
	walletPubKey: string
	walletRelays: string[]
	walletSecret: string
}

export type WalletDTO = {
	walletType: string
	walletDetails: NWCWalletDTO | OnChainIndexWallet
}

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/wallets/?userId=${string}`]: Operation<string, 'POST', never, WalletDTO, object, never>
		[k: `PUT /api/v1/wallets/?userId=${string}&walletId=${string}`]: Operation<string, 'PUT', never, WalletDTO, object, never>
		[k: `PUT /api/v1/wallets/${string}?userId=${string}`]: Operation<string, 'PUT', never, never, number, never>
		[k: `DELETE /api/v1/wallets/?userId=${string}&walletId=${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
		[k: `DELETE /api/v1/wallets/?userId=${string}&paymentDetailId=${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
	}
}

export const persistWalletMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (walletDetails: WalletDTO) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`POST /api/v1/wallets/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: walletDetails,
				})
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['walletDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const updateWalletMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ walletId, walletDetails }: { walletId: string; walletDetails: WalletDTO }) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`PUT /api/v1/wallets/?userId=${$ndkStore.activeUser.pubkey}&walletId=${walletId}`, {
					auth: true,
					body: {
						...walletDetails,
					},
				})
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['walletDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const deleteWalletMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ userId, walletId, paymentDetailId }: { userId: string; walletId?: string; paymentDetailId?: string }) => {
			if (walletId) {
				return await createRequest(`DELETE /api/v1/wallets/?userId=${userId}&walletId=${walletId}`, {
					auth: true,
				})
			} else if (paymentDetailId) {
				return await createRequest(`DELETE /api/v1/wallets/?userId=${userId}&paymentDetailId=${paymentDetailId}`, {
					auth: true,
				})
			}
			throw new Error('Either walletId or paymentDetailId must be provided')
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['walletDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const persistOnChainIndexWalletMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ paymentDetailId, index }: OnChainIndexWallet) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`POST /api/v1/wallets/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: {
						walletType: WALLET_TYPE.ON_CHAIN_INDEX,
						walletDetails: { paymentDetailId, index },
					},
				})
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['walletDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const updateOnChainIndexMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (paymentDetailId: string) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`PUT /api/v1/wallets/${paymentDetailId}?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})
			}
			return null
		},
		// onSuccess: () => {
		// 	const $ndkStore = get(ndkStore)
		// 	queryClient.invalidateQueries({ queryKey: ['onChainWalletDetails', $ndkStore.activeUser?.pubkey] })
		// },
	},
	queryClient,
)
