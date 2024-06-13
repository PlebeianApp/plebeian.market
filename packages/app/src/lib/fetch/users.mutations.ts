import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import ndkStore from '$lib/stores/ndk'
import { deleteAccount } from '$lib/stores/session'
import { get } from 'svelte/store'

import type { User } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/users/${string}`]: Operation<string, 'PUT', never, NDKUser['profile'], User, never>
		'POST /api/v1/users': Operation<string, 'POST', never, { id: string } & NDKUser['profile'], User, never>
		[k: `DELETE /api/v1/users/${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
	}
}

export const userDataMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (profile: NDKUserProfile) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: profile,
				})
				return user
			}
			return null
		},
		onSuccess: (data: User | null) => {
			const $ndkStore = get(ndkStore)

			queryClient.invalidateQueries({ queryKey: ['user', !!$ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', !!$ndkStore.activeUser?.pubkey], data)
		},
	},
	queryClient,
)

export const userDeleteAccountMutation = createMutation(
	{
		mutationFn: async () => {
			const $ndkStore = get(ndkStore)
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})

			if ($ndkStore.activeUser?.pubkey) {
				const deleted = await createRequest(`DELETE /api/v1/users/${ndkUser.pubkey}`, {
					auth: true,
				})
				return deleted
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			deleteAccount($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : '')
			delete $ndkStore.signer
			goto('/')
		},
	},
	queryClient,
)
