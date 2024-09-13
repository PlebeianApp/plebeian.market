import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getPaymentDetailsByStallId, setDefaultPaymentDetail } from '$lib/server/paymentDetails.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, request }) => {
	const stallId = params.stallId

	try {
		await authorizeUserless(request, 'GET')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const paymentDetails = await getPaymentDetailsByStallId(stallId)
	return json(paymentDetails)
}

export const POST: RequestHandler = async ({ params, request, url: { searchParams } }) => {
	const stallId = params.stallId
	const paymentDetailId = searchParams.get('paymentDetailId')

	if (!paymentDetailId) {
		error(400, 'Invalid request')
	}

	try {
		const userId = await authorizeUserless(request, 'POST')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const paymentDetails = await setDefaultPaymentDetail(paymentDetailId, stallId)
	return json(paymentDetails)
}
