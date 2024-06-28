import type { RichShippingInfo } from '$lib/server/shipping.service'
import { createQuery } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/shipping/${string}`]: Operation<string, 'GET', never, never, RichShippingInfo[], never>
	}
}
export const createShippingQuery = (stallId: string) =>
	createQuery<RichShippingInfo[]>(
		{
			queryKey: ['shipping', stallId],
			queryFn: async () => {
				const response = await createRequest(`GET /api/v1/shipping/${stallId}`, {})
				return response
			},
		},
		queryClient,
	)
