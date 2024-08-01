import type { NostrEvent } from '@nostr-dev-kit/ndk'
import { error, json } from '@sveltejs/kit'
import { productsFilterSchema } from '$lib/schema'
import {
	createProducts,
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
		return json(await getProductsByStallId(filter.data.stallId, filter.data))
	} else {
		return json(await getAllProducts(filter.data))
	}
}

export async function POST({ request }) {
	try {
		const body = (await request.json()) as unknown as NostrEvent[]
		return json(await createProducts(body))
	} catch (e) {
		console.log(e)
		error(500, JSON.stringify(e))
	}
}
