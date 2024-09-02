import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { EventCoordinates } from '$lib/interfaces'
import type { StallsFilter } from '$lib/schema'
import type { DisplayStall } from '$lib/server/stalls.service'
import { error } from '@sveltejs/kit'
import { createMutation } from '@tanstack/svelte-query'
import { stallsFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { getEventCoordinates } from '$lib/utils'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
		[k: `PUT /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
		[k: `DELETE /api/v1/stalls/${string}`]: Operation<string, 'DELETE', never, string, string, never>
	}
}

export const createStallFromNostrEvent = createMutation(
	{
		mutationFn: async (stallEvent: NostrEvent) => {
			const { coordinates } = getEventCoordinates(stallEvent) as EventCoordinates
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
				queryClient.invalidateQueries({ queryKey: ['stalls', data.userId] })
				queryClient.invalidateQueries({ queryKey: ['shippings', data.userId] })
			}
		},
	},
	queryClient,
)

export const updateStallFromNostrEvent = createMutation(
	{
		mutationFn: async ([stallId, stallEvent]: [string, NostrEvent]) => {
			try {
				const response = await createRequest(`PUT /api/v1/stalls/${stallId}`, {
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

		onSuccess: async (data: DisplayStall | null) => {
			if (data) {
				console.log('Stall inserted in db successfully', data)
				await queryClient.invalidateQueries({
					queryKey: ['stalls', data.userId],
				})
				await queryClient.invalidateQueries({ queryKey: ['shipping', data.id] })
			}
		},
	},
	queryClient,
)

export const deleteStallMutation = createMutation(
	{
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
		onSuccess: (stallId: string | null) => {
			const $ndkStore = get(ndkStore)

			console.log('deleted stall', stallId)

			queryClient.invalidateQueries({ queryKey: ['stalls', $ndkStore.activeUser?.pubkey] })
			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
			queryClient.invalidateQueries({ queryKey: ['categories', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
