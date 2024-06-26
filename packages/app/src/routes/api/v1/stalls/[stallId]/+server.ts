import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { KindStalls } from '$lib/constants'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { deleteStall, getStallById, updateStall } from '$lib/server/stalls.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getStallById(params.stallId))
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
