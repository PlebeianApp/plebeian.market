import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { deleteProduct } from '$lib/server/products.service'
import { getStallById, updateStall } from '$lib/server/stalls.service'
import { verifyEvent } from 'nostr-tools'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getStallById(params.stallId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const body = await request.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === KindStalls)
		.safeParse(body)

	if (!verifiedEvent.success) {
		return error(400, 'Invalid event')
	} else {
		return json(await updateStall(params.stallId, verifiedEvent.data))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteProduct(params.stallId))
}
