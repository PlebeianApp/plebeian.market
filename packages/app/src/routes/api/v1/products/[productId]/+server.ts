import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { deleteProduct, getProductById, updateProduct } from '$lib/server/products.service'
import { verifyEvent } from 'nostr-tools'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getProductById(params.productId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === KindProducts)
		.safeParse(body)

	if (!verifiedEvent.success) {
		return error(400, 'Invalid event')
	} else {
		return json(await updateProduct(params.productId, verifiedEvent.data))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteProduct(params.productId))
}
