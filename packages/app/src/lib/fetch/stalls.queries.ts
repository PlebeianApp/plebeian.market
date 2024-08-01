import type { StallsFilter } from '$lib/schema'
import type { RichStall } from '$lib/server/stalls.service'
import { createQuery } from '@tanstack/svelte-query'
import { fetchStallData, normalizeStallData } from '$lib/nostrSubs/utils'
import { stallsFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, { total: number; stalls: RichStall[] }, StallsFilter>
		[k: `GET /api/v1/stalls/${string}`]: Operation<string, 'GET', never, never, RichStall, never>
		[k: `GET /api/v1/stalls/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
	}
}

// export const createStallQuery = (stallId: string) =>
// 	createQuery<RichStall>(
// 		{
// 			queryKey: ['stalls', stallId],
// 			queryFn: async () => {
// 				return await createRequest(`GET /api/v1/stalls/${stallId}`, {
// 					auth: false,
// 				})
// 			},
// 		},
// 		queryClient,
// 	)
export const createStallQuery = (stallId: string) =>
	createQuery<Partial<RichStall>>({
		queryKey: ['stalls', stallId],
		queryFn: async () => {
			try {
				const dbStall = await createRequest(`GET /api/v1/stalls/${stallId}`, {})
				if (dbStall) return dbStall
			} catch (dbError) {
				console.warn('Stall not found in database')
			}

			try {
				const { stallNostrRes } = await fetchStallData(stallId)
				if (stallNostrRes) {
					const normalizedStall = (await normalizeStallData(stallNostrRes)).data
					if (normalizedStall) return normalizedStall
				}
			} catch (nostrError) {
				console.error('Error fetching stall from Nostr:', nostrError)
			}

			throw new Error('Stall not found in database or Nostr')
		},
	})

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery(
		{
			queryKey: ['stalls', ...Object.values(stallsFilterSchema.safeParse(filter).data as Partial<StallsFilter>)],
			queryFn: async () => {
				const response = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				return response
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
