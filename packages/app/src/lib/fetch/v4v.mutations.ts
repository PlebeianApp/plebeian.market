import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

interface V4VFilter {
	amount: string
	target: string
}

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/v4v?userId=${string}&v4vPlatformShare=${string}&target=${string}`]: Operation<
			string,
			'PUT',
			never,
			V4VFilter,
			number,
			never
		>
	}
}

export const setV4VForUserMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (v4vFilter: V4VFilter) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const setAmount = await createRequest(
					`PUT /api/v1/v4v?userId=${$ndkStore.activeUser.pubkey}&v4vPlatformShare=${v4vFilter.amount}&target=${v4vFilter.target}`,
					{
						auth: true,
					},
				)
				return setAmount
			}

			return 0
		},
		onSuccess: (amount: number) => {
			const $ndkStore = get(ndkStore)

			queryClient.invalidateQueries({ queryKey: ['v4v', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
