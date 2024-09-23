import type { V4VShare } from '$lib/server/v4v.service'
import { error, isHttpError, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getV4VPlatformShareForUser, setV4VSharesForUser } from '$lib/server/v4v.service'
import { z } from 'zod'

export async function GET({ request, url: { searchParams } }) {
	const userId = searchParams.get('userId')

	if (!userId) {
		error(400, 'Invalid request')
	}

	try {
		return json(await getV4VPlatformShareForUser(userId))
	} catch (e) {
		if (isHttpError(e)) {
			error(e.status, e.body)
		} else {
			error(500, 'Internal Server Error')
		}
	}
}

export async function PUT({ request, url: { searchParams } }) {
	const body = (await request.json()) as V4VShare[]

	try {
		const parseResult = z
			.array(
				z.object({
					amount: z.number().min(0, 'V4V platform share must be at least 0').max(1, 'V4V platform share must be at most 1'),
					target: z.string(),
				}),
			)
			.min(0)
			.safeParse(body)

		if (!parseResult.success) {
			error(400, `Invalid v4vPlatformShare: ${parseResult.error.message}`)
		}
		const parsedV4VPlatformShare = parseResult.data
		const userId = await authorizeUserless(request, 'PUT')
		const amount = await setV4VSharesForUser(userId, parsedV4VPlatformShare)

		return json(amount)
	} catch (e) {
		error(401, 'Unauthorized')
	}
}
