import { error, json } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service.js'
import { createUser, getAllUsers, getRichUsers, getUsersByRole } from '$lib/server/users.service'

import type { RequestHandler } from './$types.js'

export const GET: RequestHandler = async ({ request, url: { searchParams } }) => {
	const authorizationHeader = request.headers.get('Authorization')
	const spObj = Object.fromEntries(searchParams)
	const filter = usersFilterSchema.safeParse(spObj)
	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	}

	if (authorizationHeader) {
		const token = decodeJwtToEvent(authorizationHeader)
		if (token && filter.data.userId) {
			const users = await getRichUsers(filter.data)
			return json(users)
		} else if (token && filter.data.role) {
			const users = await getUsersByRole(filter.data)
			return json(users)
		}
	}

	const users = await getAllUsers(filter.data)
	const usersUnAuthResponse = users.map((user) => ({
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
	}))

	return json(usersUnAuthResponse)
}

export const POST = async ({ request }) => {
	try {
		const body = await request.json()
		return json(await createUser(body))
	} catch (e) {
		console.log('e', e)
		error(500, JSON.stringify(e))
	}
}
