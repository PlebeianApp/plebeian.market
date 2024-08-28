import { error, json } from '@sveltejs/kit'
import { authorize, authorizeUserless } from '$lib/auth'
import { createOrder, getOrderById, getOrdersByUserId, updateOrderStatus } from '$lib/server/orders.service'

import type { Order } from '@plebeian/database'

export const PUT = async ({ params, request }) => {
	const { orderId } = params
	const { status } = await request.json()

	try {
		const userId = await authorizeUserless(request, 'PUT')
		const updatedOrder = await updateOrderStatus(orderId, status, userId)
		return json(updatedOrder)
	} catch (err) {
		throw error(401, 'Unauthorized')
	}
}

// GET /api/v1/orders/:orderId
export const GET = async ({ params, request }) => {
	const { orderId } = params

	try {
		const userId = await authorizeUserless(request, 'GET')
		const order = await getOrderById(orderId)
		return json(order)
	} catch (err) {
		throw error(401, 'Unauthorized')
	}
}
