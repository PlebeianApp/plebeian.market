import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getOrderById, updateOrderStatus } from '$lib/server/orders.service'

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
