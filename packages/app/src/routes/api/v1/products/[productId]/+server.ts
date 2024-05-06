import { error, json } from '@sveltejs/kit'
import { deleteProduct, getProductById, updateProduct } from '$lib/server/products.service'

import { insertProductSchema } from '@plebeian/database'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getProductById(params.productId))
}

export const PUT: RequestHandler = async ({ params, request: { body } }) => {
	const parsedInsertProduct = insertProductSchema.safeParse(body)

	if (!parsedInsertProduct.success) {
		return error(400, 'Invalid product')
	} else {
		return json(await updateProduct(params.productId, parsedInsertProduct.data))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteProduct(params.productId))
}
