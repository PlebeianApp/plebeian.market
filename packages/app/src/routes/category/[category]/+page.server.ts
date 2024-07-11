import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'
import { getStallsByCatName } from '$lib/server/stalls.service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { category } = params
	const stalls = await getStallsByCatName(category)
	return {
		filter: catsFilterSchema.parse({ category }) as CatsFilter,
		stalls: stalls,
	}
}
