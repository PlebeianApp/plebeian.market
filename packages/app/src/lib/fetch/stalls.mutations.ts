import type { NostrEvent } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/events': Operation<string, 'POST', never, NostrEvent[], NostrEvent[], never>
	}
}

export const stallsFromNostrEvent = createMutation(
	{
		mutationKey: [],
		mutationFn: async (events: NostrEvent[]) => {
			const response = await createRequest(`POST /api/v1/events`, {
				body: events,
			})

			if (!response) {
				return null
			}

			return response
		},
		onSuccess: (data: NostrEvent[] | null) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ['products'] })
			}
		},
	},
	queryClient,
)
