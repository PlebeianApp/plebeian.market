import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { KindProducts } from '$lib/constants'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { deleteProduct, getProductById, updateProduct } from '$lib/server/products.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getProductById(params.productId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const verifiedEvent = await verifyAndPersistRawEvent(request, KindProducts)
		return json(await updateProduct(params.productId, verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ request, params }) => {
	try {
		const userId = await authorizeUserless(request, 'DELETE')
		return json(await deleteProduct(params.productId, userId))
	} catch (e) {
		error(401, 'Unauthorized')
	}
}
