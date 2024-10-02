import { error, json } from '@sveltejs/kit'
import { authorize } from '$lib/auth'
import { incrementOnChainIndex } from '$lib/server/wallet.service'

import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, url: { searchParams }, params: { paymentDetailId } }) => {
	const userId = searchParams.get('userId')
	if (!userId || !paymentDetailId) {
		throw error(400, 'Invalid request')
	}
	try {
		await authorize(request, userId, 'PUT')
		const updatedWallet = await incrementOnChainIndex(userId, paymentDetailId)
		return json(updatedWallet)
	} catch (e: unknown) {
		console.error(e)
		throw error(500, e as Error)
	}
}
