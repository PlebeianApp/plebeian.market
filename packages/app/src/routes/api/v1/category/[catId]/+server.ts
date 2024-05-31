import { json } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories } from '$lib/server/categories.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	const [cat] = await getAllCategories(catsFilterSchema.parse({ catId: params.catId }))
	return json(cat)
}
