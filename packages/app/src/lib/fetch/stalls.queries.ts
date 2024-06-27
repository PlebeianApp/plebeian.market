import type { StallsFilter } from '$lib/schema'
import type { RichStall } from '$lib/server/stalls.service'
import { createQuery } from '@tanstack/svelte-query'
import { stallsFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, RichStall[], StallsFilter>
		[k: `GET /api/v1/stalls/${string}`]: Operation<string, 'GET', never, never, RichStall, never>
	}
}

export const createStallQuery = (stallId: string) =>
	createQuery<RichStall>(
		{
			queryKey: ['stalls', stallId],
			queryFn: async () => {
				return await createRequest(`GET /api/v1/stalls/${stallId}`, {
					auth: true,
				})
			},
		},
		queryClient,
	)

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery<RichStall[]>(
		{
			queryKey: ['stalls', ...Object.values(filter)],
			queryFn: async () => {
				console.log(stallsFilterSchema.parse(filter))
				const stalls = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				return stalls
			},
		},
		queryClient,
	)
