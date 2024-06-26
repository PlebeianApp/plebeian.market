import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `DELETE /api/v1/stalls/${string}`]: Operation<string, 'DELETE', never, string, string, never>
	}
}

export const deleteStallMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (stallId: string) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const res = await createRequest(`DELETE /api/v1/stalls/${stallId}`, {
					auth: true,
				})
				return res
			}
			return null
		},
		onSuccess: (stallId: string) => {
			const $ndkStore = get(ndkStore)

			console.log('deleted stall', stallId)

			queryClient.invalidateQueries({ queryKey: ['stalls', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
