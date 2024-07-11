import { error, json } from '@sveltejs/kit'
import { getShippingMethodById } from '$lib/server/shipping.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request, url: { searchParams } }) => {
	const shippinfMethodId = searchParams.get('methodId')

	if (!shippinfMethodId) {
		return error(400, 'Invalid request')
	}

	const response = await getShippingMethodById(shippinfMethodId)
	return json(response)
}
