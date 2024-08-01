import type { NormalizedData } from '$lib/nostrSubs/utils'
import type { StallsFilter } from '$lib/schema'
import type { RichStall } from '$lib/server/stalls.service'
import { createQuery } from '@tanstack/svelte-query'
import { fetchStallData, fetchUserStallsData, normalizeStallData } from '$lib/nostrSubs/utils'
import { stallsFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, { total: number; stalls: RichStall[] }, StallsFilter>
		[k: `GET /api/v1/stalls/${string}`]: Operation<string, 'GET', never, never, RichStall, never>
		[k: `GET /api/v1/stalls/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
	}
}

export const createStallQuery = (stallId: string) =>
	createQuery<RichStall>(
		{
			queryKey: ['stalls', stallId],
			queryFn: () => {
				return createRequest(`GET /api/v1/stalls/${stallId}`, {
					auth: false,
				})
			},
		},
		queryClient,
	)

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery(
		{
			queryKey: ['stalls', ...Object.values(stallsFilterSchema.safeParse(filter).data as Partial<StallsFilter>)],
			queryFn: async () => {
				const response = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				if (response.stalls.length) return response
				if (filter.stallId) {
					const { stallNostrRes: stallData } = await fetchStallData(filter.stallId)
					if (stallData) {
						const normalizedStall = (await normalizeStallData(stallData)).data
						if (normalizedStall) {
							return { total: 1, stalls: [normalizedStall] }
						}
					}
				} else if (filter.userId) {
					const { stallNostrRes: stallData } = await fetchUserStallsData(filter.userId)
					if (stallData) {
						const normalizedStallData = (await Promise.all(Array.from(stallData).map(normalizeStallData)))
							.filter((result): result is NormalizedData<RichStall> => result.data !== null)
							.map((result) => result.data as Partial<RichStall>)
						if (normalizedStallData.length) {
							return { total: normalizedStallData.length, stalls: normalizedStallData }
						}
					}
				}
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
