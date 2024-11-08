import { error, json } from '@sveltejs/kit'
import { authorizeContextual, authorizeUserless } from '$lib/auth'
import { KindStalls } from '$lib/constants'
import { verifyEventBody } from '$lib/server/nostrEvents.service'
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
		return json(await createStall(body))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const { stallId } = params
	try {
		await authorizeContextual(request, 'stall', stallId, request.method)
		const verifiedEvent = await verifyEventBody(request, KindStalls)
		return json(await updateStall(params.stallId, verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ request, params }) => {
	const { stallId } = params

	try {
		await authorizeContextual(request, 'stall', stallId, request.method)
		return json(await deleteStall(stallId))
	} catch (e) {
		error(500, `${e}`)
	}
}
