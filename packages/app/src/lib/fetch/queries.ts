import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'
import { createRequest } from './client'

import type { User } from '@plebeian/database'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/users/${string}`]: Operation<string, 'GET', never, never, User>
	}
}

export const userQuery = derived(ndkStore, ($ndkStore) =>
	createQuery({
		queryKey: ['user', !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true
				})

				return user
			}
			return null
		},
	}),
)
