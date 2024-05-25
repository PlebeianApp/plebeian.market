import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'
import { getShippingByStallId } from '$lib/server/shipping.service'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getShippingByStallId(params.stallId))
}
