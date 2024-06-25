import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { DisplayStall } from '$lib/server/stalls.service'
import type { VerifiedEvent } from 'nostr-tools'
import { error } from '@sveltejs/kit'
import { createMutation } from '@tanstack/svelte-query'
import { getEventCoordinates } from '$lib/utils'

import type { Stall } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
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
