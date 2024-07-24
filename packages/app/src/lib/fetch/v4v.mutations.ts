import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/v4v?userId=${string}&v4vPlatformShare=${string}`]: Operation<string, 'PUT', never, string, number, number>
	}
}

export const setV4VForUserMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (amount: string) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const setAmount = await createRequest(`PUT /api/v1/v4v?userId=${$ndkStore.activeUser.pubkey}&v4vPlatformShare=${amount}`, {
					auth: true,
				})
				return setAmount
			}
			return null
		},
		onSuccess: (amount: number) => {
			const $ndkStore = get(ndkStore)

			queryClient.invalidateQueries({ queryKey: ['v4v', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
