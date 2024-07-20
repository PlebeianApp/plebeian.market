import type { CatsFilter } from '$lib/schema'
import type { RichCat } from '$lib/server/categories.service'
import { createQuery } from '@tanstack/svelte-query'
import { catsFilterSchema } from '$lib/schema'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/category': Operation<'/api/v1/category', 'GET', never, never, RichCat[], CatsFilter>
	}
}

export const createCategoriesByFilterQuery = (filter: Partial<CatsFilter>) =>
	createQuery<RichCat[]>(
		{
			queryKey: ['categories', ...Object.values(filter)],
			queryFn: async () => {
				const categories = await createRequest('GET /api/v1/category', {
					params: catsFilterSchema.parse(filter),
				})
				return categories
			},
		},
		queryClient,
	)
