import { error } from '@sveltejs/kit'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service'
import { findCustomTags } from '$lib/utils'

import { userExists } from './server/users.service'

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

export { authorize, authorizeUserless }
