import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { KindStalls } from '$lib/constants'
import { persistEvent, verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { deleteProduct } from '$lib/server/products.service'
import { createStall, deleteStall, getStallById, stallExists, updateStall } from '$lib/server/stalls.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, url: { searchParams } }) => {
	if (searchParams.has('exists')) {
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

export const DELETE: RequestHandler = async ({ request, params }) => {
	try {
		const userId = await authorizeUserless(request, 'DELETE')
		return json(await deleteStall(params.stallId, userId))
	} catch (e) {
		error(401, 'Unauthorized')
	}
}
