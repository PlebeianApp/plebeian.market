import { error, json } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { productsFilterSchema } from '$lib/schema'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import {
	createProduct,
	getAllProducts,
	getProductsByCatName,
	getProductsByStallId,
	getProductsByUserId,
} from '$lib/server/products.service.js'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = productsFilterSchema.safeParse(spObj)
	if (!filter.success) {
		error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else if (filter.data.category) {
		return json(await getProductsByCatName(filter.data))
	} else if (filter.data.userId) {
		return json(await getProductsByUserId(filter.data))
	} else if (filter.data.stallId) {
		return json(await getProductsByStallId(filter.data.stallId))
	} else {
		return json(await getAllProducts(filter.data))
	}
}

export async function POST({ request }) {
	try {
		const verifiedEvent = await verifyAndPersistRawEvent(request, KindProducts)
		return json(await createProduct(verifiedEvent))
	} catch (e) {
		console.log(e)
		error(500, JSON.stringify(e))
	}
}
