import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/v4v?userId=${string}`]: Operation<string, 'GET', never, never, number, never>
	}
}

export const platformV4VForUserQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['v4v', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/v4v?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: false,
				})

				return user
			}
			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)
