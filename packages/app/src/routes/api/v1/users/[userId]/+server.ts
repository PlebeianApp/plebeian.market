import { error, json } from '@sveltejs/kit'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service'
import { deleteUser, getUserById, updateUser } from '$lib/server/users.service'
import { findCustomTags } from '$lib/utils'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, request }) => {
	const authorizationHeader = request.headers.get('Authorization')

	if (authorizationHeader) {
		const token = decodeJwtToEvent(authorizationHeader)
		if (token.pubkey === params.userId && findCustomTags(token.tags, 'method')[0] === request.method) {
			return json(await getUserById(params.userId))
		}

		return error(500, 'Invalid Token')
	}

	const user = await getUserById(params.userId)

	const userUnAuthResponse = {
		created_at: user.createdAt.getTime() / 1000,
		name: user.name,
		displayName: user.displayName,
		about: user.about,
		image: user.image,
		banner: user.banner,
		nip05: user.nip05,
		lud06: user.lud06,
		lud16: user.lud16,
		zapService: user.zapService,
		website: user.website,
		trustLevel: user.trustLevel,
	}

	return json(userUnAuthResponse)
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const authorizationHeader = request.headers.get('Authorization')

	if (authorizationHeader) {
		const token = decodeJwtToEvent(authorizationHeader)
		if (token.pubkey === params.userId && findCustomTags(token.tags, 'method')[0] === request.method) {
			return json(await getUserById(params.userId))
		}

		return error(500, 'Invalid Token')
	}

	try {
		const body = await request.json()
		return json(await updateUser(params.userId, body.profile))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteUser(params.userId))
}
