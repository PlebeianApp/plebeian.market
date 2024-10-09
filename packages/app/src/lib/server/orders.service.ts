import type { OrdersFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { ordersFilterSchema } from '$lib/schema'

import type { Order, OrderStatus } from '@plebeian/database'
import { and, db, eq, orderItems, orders, sql } from '@plebeian/database'

export type DisplayOrder = Pick<
	Order,
	| 'id'
	| 'createdAt'
	| 'updatedAt'
	| 'sellerUserId'
	| 'buyerUserId'
	| 'status'
	| 'shippingId'
	| 'stallId'
	| 'address'
	| 'zip'
	| 'city'
	| 'country'
	| 'region'
	| 'contactName'
	| 'contactPhone'
	| 'contactEmail'
	| 'observations'
> & {
	orderItems: {
		productId: string
		qty: number
	}[]
}

const resolveOrderItems = async (orderId: string): Promise<{ productId: string; qty: number }[]> => {
	return await db.query.orderItems.findMany({
		where: eq(orderItems.orderId, orderId),
	})
}

export const isAuthorizedToUpdateOrderStatus = async (orderId: string, userId: string, newStatus: OrderStatus): Promise<boolean> => {
	const order = await getOrderById(orderId)

	if (order.sellerUserId === userId || order.buyerUserId === userId) {
		switch (order.status) {
			case 'pending':
				return newStatus === 'confirmed' || newStatus === 'canceled'
			case 'confirmed':
				return newStatus === 'shipped' || newStatus === 'canceled'
			case 'shipped':
				return newStatus === 'completed'
			default:
				return false
		}
	}

	return false
}

export const getAllOrders = async (filter: OrdersFilter = ordersFilterSchema.parse({})) => {
	const orderBy = {
		createdAt: orders.createdAt,
		updatedAt: orders.updatedAt,
	}[filter.orderBy]

	const orderColumn = filter.role === 'buyer' ? orders.buyerUserId : orders.sellerUserId

	const ordersResult = await db.query.orders.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		orderBy: (orders, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
		where: and(filter.userId ? eq(orderColumn, filter.userId) : undefined),
	})

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(and(filter.userId ? eq(orderColumn, filter.userId) : undefined))

	const displayOrders: DisplayOrder[] = await Promise.all(
		ordersResult.map(async (order) => {
			const orderItems = await resolveOrderItems(order.id)
			return { ...order, orderItems }
		}),
	)

	if (displayOrders) {
		return { total, orders: displayOrders }
	}

	error(404, 'Not found')
}

export const getOrderById = async (orderId: string): Promise<DisplayOrder> => {
	const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).execute()

	if (order) {
		const orderItems = await resolveOrderItems(order.id)
		return { ...order, orderItems }
	}

	if (!order) {
		error(404, 'Order not found')
	}

	return order
}

export const getOrdersByUserId = async (userId: string, role: 'buyer' | 'seller'): Promise<{ total: number; orders: DisplayOrder[] }> => {
	const orderColumn = role === 'buyer' ? orders.buyerUserId : orders.sellerUserId

	const ordersResult = await db.select().from(orders).where(eq(orderColumn, userId)).execute()

	const ordersWithItems = await Promise.all(
		ordersResult.map(async (order) => {
			const orderItems = await resolveOrderItems(order.id)
			return { ...order, orderItems }
		}),
	)

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(eq(orderColumn, userId))

	if (ordersResult) {
		return { total, orders: ordersWithItems }
	}

	error(404, 'No orders found')
}
export const createOrder = async (order: Omit<Order, 'id'>): Promise<DisplayOrder> => {
	const [newOrder] = await db.insert(orders).values(order).returning()

	if (newOrder) {
		return {
			...newOrder,
			orderItems: [],
		}
	}

	error(500, 'Failed to create order')
}

export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, userId: string): Promise<DisplayOrder> => {
	const [updatedOrder] = await db.update(orders).set({ status: newStatus, updatedAt: new Date() }).where(eq(orders.id, orderId)).returning()

	if (updatedOrder) {
		return {
			...updatedOrder,
			orderItems: [],
		}
	}

	error(500, 'Failed to update order status')
}
