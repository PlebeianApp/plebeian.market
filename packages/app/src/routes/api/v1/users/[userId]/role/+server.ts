import { error, json } from '@sveltejs/kit'
import { authorize, authorizeAdmin } from '$lib/auth'
import { getUserRole, updateUserRole } from '$lib/server/users.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, request }) => {
	const { userId } = params
	try {
		await authorize(request, userId, 'GET')
		return json(await getUserRole(userId))
	} catch (e) {
		error(e.status, e.message)
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const { userId } = params
	try {
		await authorizeAdmin(request, 'PUT')
		const body = await request.json()
		return json(await updateUserRole(userId, body.role))
	} catch (e) {
		error(e.status, e.message)
	}
}
