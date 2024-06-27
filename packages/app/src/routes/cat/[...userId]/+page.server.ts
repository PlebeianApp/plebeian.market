import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { userId } = params
	return { filter: catsFilterSchema.parse({ userId }) as CatsFilter }
}
