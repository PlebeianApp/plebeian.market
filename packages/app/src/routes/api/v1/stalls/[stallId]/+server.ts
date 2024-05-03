import { json } from '@sveltejs/kit'
import { getStallById } from '$lib/server/stalls.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getStallById(params.stallId))
}
