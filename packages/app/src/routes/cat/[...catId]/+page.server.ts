import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { catId } = params
	const parsedParams = catId.split('/')
	if (parsedParams.length == 1) {
		return {
			filter: catsFilterSchema.parse({ catId: parsedParams[0] }) as CatsFilter,
		}
	} else if (parsedParams.length == 2 && parsedParams[0] == 'n') {
		return {
			filter: catsFilterSchema.parse({ catName: parsedParams[1] }) as CatsFilter,
		}
	}
	return {
		filter: catsFilterSchema.parse({ catId: parsedParams[0] }) as CatsFilter,
	}
}
