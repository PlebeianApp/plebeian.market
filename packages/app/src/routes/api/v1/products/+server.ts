import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { productsFilterSchema } from '$lib/schema'
import { createProduct, getAllProducts } from '$lib/server/products.service.js'
import { verifyEvent } from 'nostr-tools'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = productsFilterSchema.safeParse(spObj)

	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		console.log('filter.data:', filter.data)
		return json(await getAllProducts(filter.data))
	}
}

export async function POST({ request }) {
	const body = await request.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === 30018)
		.safeParse(body)

	if (!verifiedEvent.success) {
		return error(400, `Invalid request: ${JSON.stringify(verifiedEvent.error)}`)
	} else {
		return json(await createProduct(verifiedEvent.data))
	}
}
