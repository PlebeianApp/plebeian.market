import type { NDKUser } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import type { User } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/users/${string}`]: Operation<string, 'PUT', never, NDKUser['profile'], User, never>
	}
}

export const userDataMutation = createMutation(
	derived(ndkStore, ($ndkStore) => ({
		mutationFn: async () => {
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: ndkUser.profile,
				})
				return user
			}
			return null
		},
		onSuccess: (data: User | null) => {
			queryClient.invalidateQueries({ queryKey: ['user', !!$ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', !!$ndkStore.activeUser?.pubkey], data)
		},
	})),
	queryClient
)
