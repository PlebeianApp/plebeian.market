import { getAllCategories } from '$lib/server/categories.service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const categories = await getAllCategories()
	return { cats: categories }
}
