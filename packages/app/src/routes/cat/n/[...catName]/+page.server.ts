import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { catName } = params
	return { filter: catsFilterSchema.parse({ catName: catName }) as CatsFilter }
}
