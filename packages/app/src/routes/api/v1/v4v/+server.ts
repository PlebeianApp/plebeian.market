import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getV4VPlatformShareForUserByTarget, setV4VPlatformShareForUserByTarget } from '$lib/server/v4v.service'
import { z } from 'zod'

export async function GET({ request, url: { searchParams } }) {
	const userId = searchParams.get('userId')
	const target = searchParams.get('target')

	if (!userId || !target) {
		error(400, 'Invalid request')
	}

	try {
		return json(await getV4VPlatformShareForUserByTarget(userId, target))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}

export async function PUT({ request, url: { searchParams } }) {
	const v4vPlatformShare = searchParams.get('v4vPlatformShare')
	const target = searchParams.get('target')

	if (!v4vPlatformShare || !target) {
		error(400, 'Invalid request: userId and v4vPlatformShare are required')
	}

	try {
		const parseResult = z
			.number()
			.min(0, 'V4V platform share must be at least 0')
			.max(1, 'V4V platform share must be at most 1')
			.safeParse(parseFloat(v4vPlatformShare))
		if (!parseResult.success) {
			error(400, `Invalid v4vPlatformShare: ${parseResult.error.message}`)
		}
		const parsedV4VPlatformShare = parseResult.data
		const userId = await authorizeUserless(request, 'PUT')
		const amount = await setV4VPlatformShareForUserByTarget(parsedV4VPlatformShare, userId, target)

		return json(amount)
	} catch (e) {
		error(401, 'Unauthorized')
	}
}
