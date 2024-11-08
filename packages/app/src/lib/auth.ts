import { error } from '@sveltejs/kit'
import { decodeJwtToEvent } from '$lib/server/nostrAuth.service'
import { findCustomTags } from '$lib/utils'

import { getOrderById } from './server/orders.service'
import { getProductById } from './server/products.service'
import { getStallById } from './server/stalls.service'
import { getUserById, getUserRole, isUserAdmin, userExists } from './server/users.service'

type ResourceType = 'user' | 'stall' | 'product' | 'order'

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

const authorizeEditorOrAdmin = async (request: Request, method: string): Promise<boolean> => {
	const authorizationHeader = request.headers.get('Authorization')

	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)

	if (token.pubkey && findCustomTags(token.tags, 'method')[0] === method) {
		const userRole = await getUserRole(token.pubkey)

		if (userRole === 'admin' || userRole === 'editor') {
			return true
		}
		throw error(403, 'User is not authorized')
	}

	throw error(401, 'Invalid Token')
}

const resourceOwnerMap = {
	user: async (resourceId: string) => resourceId,
	stall: async (resourceId: string) => (await getStallById(resourceId)).userId,
	product: async (resourceId: string) => (await getProductById(resourceId)).userId,
	order: async (resourceId: string) => (await getOrderById(resourceId)).buyerUserId,
} as const

const getResourceOwner = async (resourceType: ResourceType, resourceId: string): Promise<string> => {
	const getOwner = resourceOwnerMap[resourceType]
	if (!getOwner) {
		throw error(400, 'Invalid resource type')
	}
	return getOwner(resourceId)
}

const authorizeContextual = async (request: Request, resourceType: ResourceType, resourceId: string, method: string): Promise<boolean> => {
	const authorizationHeader = request.headers.get('Authorization')

	if (!authorizationHeader) {
		throw error(401, 'Authorization header missing')
	}

	const token = decodeJwtToEvent(authorizationHeader)
	const requestMethod = findCustomTags(token.tags, 'method')[0]

	if (!token.pubkey || requestMethod !== method) {
		throw error(401, 'Invalid Token')
	}

	try {
		const userRole = await getUserRole(token.pubkey)
		if (userRole === 'admin' || userRole === 'editor') {
			return true
		}

		const resourceOwner = await getResourceOwner(resourceType, resourceId)
		if (token.pubkey === resourceOwner) {
			return true
		}

		throw error(403, 'User is not authorized')
	} catch (e) {
		if (e.status) {
			throw e
		}
		throw error(500, 'Internal Server Error')
	}
}

export { authorize, authorizeAdmin, authorizeContextual, authorizeEditorOrAdmin, authorizeUserless }
