import { error, json } from '@sveltejs/kit'
import { deleteUser, getUserById, updateUser } from '$lib/server/users.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	return json(await getUserById(params.userId))
}

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json()
		return json(await updateUser(params.userId, body))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ params }) => {
	return json(await deleteUser(params.userId))
}
