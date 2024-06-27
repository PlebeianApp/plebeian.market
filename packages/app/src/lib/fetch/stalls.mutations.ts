import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { DisplayStall } from '$lib/server/stalls.service'
import { error } from '@sveltejs/kit'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { getEventCoordinates } from '$lib/utils'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
		[k: `DELETE /api/v1/stalls/${string}`]: Operation<string, 'DELETE', never, string, string, never>
	}
}

export const stallFromNostrEvent = createMutation(
	{
		mutationKey: [],
		mutationFn: async (stallEvent: NostrEvent) => {
			const { coordinates } = getEventCoordinates(stallEvent)
			try {
				const response = await createRequest(`POST /api/v1/stalls/${coordinates}`, {
					body: stallEvent,
				})
				if (!response) {
					return null
				}
				return response
			} catch (e) {
				console.error(e)
				throw error(500, `Failed to mutate stall, ${e}`)
			}
		},

		onSuccess: (data: DisplayStall | null) => {
			if (data) {
				console.log('Stall inserted in db successfully', data)
				queryClient.invalidateQueries({ queryKey: ['stalls'] })
			}
		},
	},
	queryClient,
)

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
			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
			queryClient.invalidateQueries({ queryKey: ['categories', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
