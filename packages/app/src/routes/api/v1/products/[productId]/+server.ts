import { error, json } from '@sveltejs/kit'
import { authorizeContextual } from '$lib/auth'
import { KindProducts } from '$lib/constants'
import { verifyEventBody } from '$lib/server/nostrEvents.service'
import { deleteProduct, getProductById, productExists, updateProduct } from '$lib/server/products.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, url: { searchParams } }) => {
	if (searchParams.has('exists')) {
		return json(await productExists(params.productId))
	}
	return json(await getProductById(params.productId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const { productId } = params
	try {
		await authorizeContextual(request, 'product', productId, request.method)
		const verifiedEvent = await verifyEventBody(request, KindProducts)
		return json(await updateProduct(params.productId, verifiedEvent))
	} catch (e) {
		console.error(e)
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ request, params }) => {
	const { productId } = params
	try {
		await authorizeContextual(request, 'product', productId, request.method)
		return json(await deleteProduct(params.productId))
	} catch (e) {
		error(401, 'Unauthorized')
	}
}
