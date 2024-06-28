import { json } from '@sveltejs/kit'
import { getShippingByStallId } from '$lib/server/shipping.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	const response = await getShippingByStallId(params.stallId)
	return json(response)
}
