import { json } from '@sveltejs/kit'
import { getShippingByStallId } from '$lib/server/shipping.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getShippingByStallId(params.stallId))
}
