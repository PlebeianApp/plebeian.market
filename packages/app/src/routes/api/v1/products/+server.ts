import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { createProduct, getAllProducts } from '$lib/server/products.service.js'
import { verifyEvent } from 'nostr-tools'

export async function GET({ url: { searchParams } }) {
	const page = searchParams.get('page')
	const pageSize = searchParams.get('pageSize')
	const orderBy = searchParams.get('orderBy')
	const order = searchParams.get('order')

	const filter = {
		pageSize: pageSize ? parseInt(pageSize) : 10,
		page: page ? parseInt(page) : 1,
		orderBy: (orderBy ? orderBy : 'createdAt') as 'createdAt' | 'price',
		order: (order ? order : 'asc') as 'asc' | 'desc',
	}
	return json(await getAllProducts(filter))
}

export async function POST({ request }) {
	const body = await request.json()
	const verifiedEvent = n.event().refine(verifyEvent).safeParse(body)

	if (!verifiedEvent.success) {
		return error(400, `Invalid request: ${JSON.stringify(verifiedEvent.error)}`)
	} else {
		return json(await createProduct(verifiedEvent.data))
	}
}
