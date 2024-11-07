import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import { error, json } from '@sveltejs/kit'
import { authorize, authorizeEditorOrAdmin, authorizeUserless } from '$lib/auth'
import { usersFilterSchema } from '$lib/schema'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service'
import { createUser, deleteUser, getRichUsers, getUserById, updateUser, updateUserFromNostr, userExists } from '$lib/server/users.service'

import type { RequestHandler } from './$types'
import { userEventSchema } from '../../../../../schema/nostr-events'

export const GET: RequestHandler = async ({ params, request, url: { searchParams } }) => {
	const { userId } = params
	try {
		await authorize(request, userId, 'GET')
		const [userRes] = await getRichUsers(usersFilterSchema.parse({ userId }))
		return json(userRes)
	} catch (e) {
		if (e.status === 401) {
			if (searchParams.has('exists')) return json(await userExists(userId))
			const user = await getUserById(userId)
			const userUnAuthResponse = {
				id: user.id,
				created_at: user.createdAt.getTime() / 1000,
				updated_at: user.updatedAt.getTime() / 1000,
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
			}
			return json(userUnAuthResponse)
		}
		throw e
	}
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const { userId } = params
	try {
		await authorize(request, userId, 'PUT')
		const body = await request.json()
		return json(await updateUser(userId, body))
	} catch (e) {
		if (e.status === 401) {
			try {
				const body = await request.json()
				const { data, success, error: parseError } = userEventSchema.strip().safeParse(body)
				if (!success) throw `${parseError}`
				return json(await updateUserFromNostr(userId, data as NDKUserProfile))
			} catch (updateError) {
				error(500, JSON.stringify(updateError))
			}
		} else {
			error(e.status, e.message)
		}
	}
}

export const POST: RequestHandler = async ({ request, params: { userId } }) => {
	try {
		if (!userId) throw Error('Invalid request')
		await authorizeUserless(request, userId)
		const body = await request.json()
		return json(await createUser(body))
	} catch (e) {
		if (e.status === 401) {
			const body = await request.json()
			return json(await createUser(body, true))
		} else if (e.status) {
			return error(e.status, e.message)
		}
		return error(500, JSON.stringify(e))
	}
}

export const DELETE: RequestHandler = async ({ params, request }) => {
	const authorizationHeader = request.headers.get('Authorization')
	const { userId } = params

	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)

	console.log(token.pubkey, userId)

	if (token.pubkey !== userId) {
		try {
			await authorizeEditorOrAdmin(request, 'DELETE')
			console.log('authorized')
			return json(await deleteUser(userId))
		} catch (e) {
			throw error(401, 'Invalid Token')
		}
	} else {
		try {
			await authorize(request, userId, 'DELETE')
			return json(await deleteUser(userId))
		} catch (e) {
			if (e.status) {
				error(e.status, e.message)
			}
			throw error(500, JSON.stringify(e))
		}
	}
}
