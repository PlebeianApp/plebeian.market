import type { StallsFilter } from "$lib/schema"
import { stallsFilterSchema } from "$lib/schema"
import type { RichStall } from "$lib/server/stalls.service"
import { createQuery } from "@tanstack/svelte-query"
import { createRequest, queryClient } from "./client"

declare module './client' {
	interface Endpoints {
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, RichStall[], StallsFilter>
	}
}

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery<RichStall[]>(
		{
			queryKey: ['stalls', ...Object.values(filter)],
			queryFn: async () => {
				const stalls = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				return stalls
			},
		},
		queryClient,
	)
