import { NDKKind } from '@nostr-dev-kit/ndk'
import { error, json } from '@sveltejs/kit'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { deleteUser, getUserById, updateUser } from '$lib/server/users.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getUserById(params.userId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const verifiedEvent = await verifyAndPersistRawEvent(request, NDKKind.Metadata)
		console.log(verifiedEvent)
		return json(await updateUser(params.userId, verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteUser(params.userId))
}
