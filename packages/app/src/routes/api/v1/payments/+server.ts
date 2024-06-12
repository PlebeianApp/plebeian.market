import { error, json } from '@sveltejs/kit'
import { authorize } from '$lib/auth'
import {
	createPaymentDetail,
	deletePaymentDetail,
	getPaymentDetailsByUserId,
	updatePaymentDetail,
} from '$lib/server/paymentDetails.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')

	if (!userId) {
		error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'GET')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const paymentDetails = await getPaymentDetailsByUserId(userId)
	return json(paymentDetails)
}

export const POST: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')

	if (!userId) {
		error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'POST')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const paymentDetail = await request.json()

	const insertPaymentDetail = {
		...paymentDetail,
		userId,
	}

	const newPaymentDetail = await createPaymentDetail(insertPaymentDetail)
	return json(newPaymentDetail)
}

export const PUT: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')
	const paymentDetailId = searchParams.get('paymentDetailId')

	if (!userId || !paymentDetailId) {
		error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'PUT')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const paymentDetail = await request.json()

	const updatedPaymentDetail = await updatePaymentDetail(paymentDetailId, paymentDetail)
	return json(updatedPaymentDetail)
}

export const DELETE: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')
	const paymentDetailId = searchParams.get('paymentDetailId')

	console.log(userId, paymentDetailId)

	if (!userId || !paymentDetailId) {
		error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'DELETE')
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const deleted = await deletePaymentDetail(paymentDetailId)

	if (!deleted) {
		error(404, 'Payment detail not found')
	}

	return json({ deleted })
}
