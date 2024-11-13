import type { NormalizedData } from '$lib/nostrSubs/utils'
import type { StallsFilter } from '$lib/schema'
import type { RichStall } from '$lib/server/stalls.service'
import { createQuery } from '@tanstack/svelte-query'
import { aggregatorAddStall } from '$lib/nostrSubs/data-aggregator'
import { fetchStallData, fetchUserStallsData, normalizeStallData } from '$lib/nostrSubs/utils'
import { stallsFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'
import { createStallExistsKey, createStallKey, createStallsByFilterKey } from './keys'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, { total: number; stalls: RichStall[] }, StallsFilter>
		[k: `GET /api/v1/stalls/${string}`]: Operation<string, 'GET', never, never, RichStall, never>
		[k: `GET /api/v1/stalls/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
	}
}

export const createStallQuery = (stallId: string) =>
	createQuery<{ stall: Partial<RichStall> | null }>(
		{
			queryKey: createStallKey(stallId),
			queryFn: async () => {
				try {
					const stall = await createRequest(`GET /api/v1/stalls/${stallId}`, {})
					return { stall: stall as RichStall }
				} catch (error) {
					const { stallNostrRes: stallData } = await fetchStallData(stallId)
					if (stallData) {
						aggregatorAddStall(stallData)
						const normalized = await normalizeStallData(stallData)
						return { stall: normalized.data }
					}
					return { stall: null }
				}
			},
			enabled: !!stallId,
		},
		queryClient,
	)

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery<{ total: number; stalls: Partial<RichStall>[] } | null>(
		{
			queryKey: createStallsByFilterKey(filter),
			queryFn: async () => {
				const response = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				if (response.stalls.length) return response

				if (filter.stallId) {
					const { stallNostrRes: stallData } = await fetchStallData(filter.stallId)
					const normalizedStall = stallData ? await normalizeStallData(stallData) : null
					if (normalizedStall?.data && normalizedStall.error === null) {
						return { total: 1, stalls: [normalizedStall.data] }
					}
				} else if (filter.userId) {
					const { stallNostrRes: stallData } = await fetchUserStallsData(filter.userId)
					if (stallData) {
						const normalizedStallData = (await Promise.all(Array.from(stallData).map(normalizeStallData)))
							.filter((result): result is NormalizedData<RichStall> => result.data !== null && result.error == null)
							.map((result) => result.data as Partial<RichStall>)
						if (normalizedStallData.length) {
							return { total: normalizedStallData.length, stalls: normalizedStallData }
						}
					}
				}
				return null
			},
		},
		queryClient,
	)

export const createStallExistsQuery = (id: string) =>
	createQuery<boolean>(
		{
			queryKey: createStallExistsKey(id),
			queryFn: async () => {
				const stallExists = await createRequest(`GET /api/v1/stalls/${id}?exists`, {})
				return stallExists
			},
			staleTime: Infinity,
		},
		queryClient,
	)
