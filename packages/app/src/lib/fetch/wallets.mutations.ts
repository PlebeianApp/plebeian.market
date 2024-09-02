import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

export type NWCWalletDTO = {
	walletPubKey: string
	walletRelays: string[]
	walletSecret: string
}

export type WalletDTO = {
	walletType: string
	walletDetails: NWCWalletDTO
}

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/wallets/?userId=${string}`]: Operation<string, 'POST', never, WalletDTO, object, never>
		[k: `PUT /api/v1/wallets/?userId=${string}&walletId=${string}`]: Operation<string, 'PUT', never, WalletDTO, object, never>
		[k: `DELETE /api/v1/wallets/?walletId=${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
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
		mutationFn: async (walletId: string) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`DELETE /api/v1/wallets/?walletId=${walletId}`, {
					auth: true,
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
