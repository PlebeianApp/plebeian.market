import { error, json } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { persistEvent, verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { deleteProduct } from '$lib/server/products.service'
import { createStall, getStallById, stallExists, updateStall } from '$lib/server/stalls.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, url: { searchParams } }) => {
	if (!searchParams.has('exists')) {
		return json(await stallExists(params.stallId))
	}
	return json(await getStallById(params.stallId))
}

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json()
		await persistEvent(body)
		return json(await createStall(body))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const verifiedEvent = await verifyAndPersistRawEvent(request, KindStalls)
		return json(await updateStall(params.stallId, verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteProduct(params.stallId))
}
