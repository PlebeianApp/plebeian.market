import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'
import { getStallsByCatName } from '$lib/server/stalls.service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { catName } = params
	const stalls = await getStallsByCatName(catName)
	console.log(stalls)
	return {
		filter: catsFilterSchema.parse({ catName: catName }) as CatsFilter,
		stalls: stalls,
	}
}
