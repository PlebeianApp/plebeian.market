import type { NormalizedCart } from '$lib/stores/cart'
import { error, json } from '@sveltejs/kit'
import { authorize } from '$lib/auth'
import { InvoiceInDbSchema, OrderInDbSchema, OrderItemInDbSchema } from '$lib/schema'

import type { InvoiceMessage, OrderMessage } from '@plebeian/database'
import { db, invoices, orderItems, orders } from '@plebeian/database'

function convertToOrderInDb(order: OrderMessage) {
	return OrderInDbSchema.parse({
		...order,
		createdAt: new Date(order.createdAt ?? Date.now()),
		updatedAt: new Date(order.updatedAt ?? Date.now()),
		region: order.region || null,
		contactPhone: order.contactPhone || null,
		contactEmail: order.contactEmail || null,
		observations: order.observations || null,
	})
}

function convertToOrderItemsInDb(orderId: string, order: OrderMessage) {
	return order.items.map((item) =>
		OrderItemInDbSchema.parse({
			orderId,
			productId: item.product_id,
			qty: item.quantity,
		}),
	)
}

function convertToInvoiceInDb(invoice: InvoiceMessage) {
	return InvoiceInDbSchema.parse({
		...invoice,
		type: invoice.type,
		createdAt: new Date(invoice.createdAt),
		updatedAt: new Date(invoice.updatedAt),
		paymentDetails: invoice.paymentId,
	})
}

export const POST = async ({ request }) => {
	const cartData: NormalizedCart = await request.json()
	try {
		const orders = Object.values(cartData.orders)

		if (orders.length === 0) {
			throw new Error('No orders found')
		}

		const buyerUserId = orders[0].buyerUserId

		if (orders.some((order) => order.buyerUserId !== buyerUserId)) {
			throw new Error('Inconsistent buyerUserIds found')
		}

		await authorize(request, buyerUserId, 'POST')
	} catch (e) {
		throw error(401, 'Unauthorized')
	}
	try {
		const result = await db.transaction(async (tx) => {
			const insertedOrders = []
			const insertedOrderItems = []
			const insertedInvoices = []

			for (const order of Object.values(cartData.orders)) {
				const orderInDb = convertToOrderInDb(order)
				const insertedOrder = await tx.insert(orders).values(orderInDb)
				insertedOrders.push(insertedOrder)
				const orderItemsInDb = convertToOrderItemsInDb(orderInDb.id!, order)
				const insertedOrderItem = await tx.insert(orderItems).values(orderItemsInDb)
				insertedOrderItems.push(insertedOrderItem)
			}

			for (const invoice of Object.values(cartData.invoices)) {
				const invoiceInDb = convertToInvoiceInDb(invoice)
				const insertedInvoice = await tx.insert(invoices).values({
					...invoiceInDb,
					type: invoiceInDb.type,
					totalAmount: invoiceInDb.totalAmount.toString(),
				})
				insertedInvoices.push(insertedInvoice)
			}

			return { insertedOrders, insertedOrderItems, insertedInvoices }
		})

		return json({ success: true })
	} catch (err) {
		console.error('Error persisting orders and invoices:', err)
		throw error(500, `Failed to persist orders and invoices: ${err}`)
	}
}
