import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { catId } = params
	return { filter: catsFilterSchema.parse({ catId: catId }) as CatsFilter }
}
