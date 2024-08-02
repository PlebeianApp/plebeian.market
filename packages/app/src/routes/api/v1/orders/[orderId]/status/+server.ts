import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { isAuthorizedToUpdateOrderStatus, updateOrderStatus } from '$lib/server/orders.service'

export const PUT = async ({ params, request }) => {
	const { orderId } = params
	const { status } = await request.json()

	try {
		const userId = await authorizeUserless(request, 'PUT')
		const isAuthorized = await isAuthorizedToUpdateOrderStatus(orderId, userId, status)

		if (!isAuthorized) {
			throw error(403, 'Forbidden')
		}

		const updatedOrder = await updateOrderStatus(orderId, status, userId)
		return json(updatedOrder)
	} catch (err) {
		throw error(401, 'Unauthorized')
	}
}
