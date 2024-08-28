import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { ordersFilterSchema } from '$lib/schema'
import { createOrder, getAllOrders, getOrderById, getOrdersByUserId } from '$lib/server/orders.service'

export const GET = async ({ url }) => {
	const filter = ordersFilterSchema.safeParse(Object.fromEntries(url.searchParams))

	if (!filter.success) {
		throw error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	}

	if (filter.data.orderId) {
		const order = await getOrderById(filter.data.orderId)
		return json(order)
	} else if (filter.data.userId) {
		if (!filter.data.role) {
			throw error(400, 'Role is required')
		}
		const orders = await getOrdersByUserId(filter.data.userId, filter.data.role)
		return json(orders)
	} else {
		const orders = await getAllOrders(filter.data)
		return json(orders)
	}
}

export const POST = async ({ request }) => {
	const orderData = await request.json()

	try {
		const userId = await authorizeUserless(request, 'POST')
		const newOrder = await createOrder({
			...orderData,
			sellerUserId: userId,
			buyerUserId: orderData.buyerUserId,
		})
		return json(newOrder)
	} catch (err) {
		throw error(401, 'Unauthorized')
	}
}
