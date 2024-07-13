import type { StallsFilter } from '$lib/schema'
import type { RichStall } from '$lib/server/stalls.service'
import { createQuery } from '@tanstack/svelte-query'
import { stallsFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, RichStall[], StallsFilter>
		[k: `GET /api/v1/stalls/${string}`]: Operation<string, 'GET', never, never, RichStall, never>
		[k: `GET /api/v1/stalls/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
	}
}

export const createStallQuery = (stallId: string) =>
	createQuery<RichStall>(
		{
			queryKey: ['stalls', stallId],
			queryFn: async () => {
				return await createRequest(`GET /api/v1/stalls/${stallId}`, {
					auth: false,
				})
			},
		},
		queryClient,
	)

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery<RichStall[]>(
		{
			queryKey: ['stalls', ...Object.values(stallsFilterSchema.safeParse(filter).data as Partial<StallsFilter>)],
			queryFn: async () => {
				const stalls = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				return stalls
			},
		},
		queryClient,
	)

export const createStallExistsQuery = (id: string) =>
	createQuery<boolean>(
		{
			queryKey: ['stalls', 'exists', id],
			queryFn: async () => {
				const stallExists = await createRequest(`GET /api/v1/stalls/${id}?exists`, {})
				return stallExists
			},
			staleTime: Infinity,
		},
		queryClient,
	)
