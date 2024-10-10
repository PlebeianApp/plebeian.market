import { error } from '@sveltejs/kit'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service'
import { findCustomTags } from '$lib/utils'

import { getUserById, isUserAdmin, userExists } from './server/users.service'

const authorizeUserless = async (request: Request, method: string): Promise<string> => {
	const authorizationHeader = request.headers.get('Authorization')

	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)
	if (token.pubkey && findCustomTags(token.tags, 'method')[0] === method) {
		if (await userExists(token.pubkey)) {
			return token.pubkey
		}
		throw error(401, 'User does not exist')
	}

	throw error(401, 'Invalid Token')
}

const authorize = async (request: Request, userId: string, method: string) => {
	const authorizationHeader = request.headers.get('Authorization')
	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)
	if (token.pubkey === userId && findCustomTags(token.tags, 'method')[0] === method) {
		return true
	}
	throw error(401, 'Invalid Token')
}

const authorizeAdmin = async (request: Request, method: string): Promise<boolean> => {
	const authorizationHeader = request.headers.get('Authorization')

	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)

	if (token.pubkey && findCustomTags(token.tags, 'method')[0] === method) {
		const user = await getUserById(token.pubkey)

		const adminRole = await isUserAdmin(user.id)

		if (user && adminRole) {
			return true
		}
		throw error(403, 'User is not an admin')
	}

	throw error(401, 'Invalid Token')
}

export { authorize, authorizeAdmin, authorizeUserless }
