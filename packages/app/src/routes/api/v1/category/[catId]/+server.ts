import { json } from '@sveltejs/kit'
import { getCategoryById } from '$lib/server/categories.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getCategoryById(params.catId))
}
