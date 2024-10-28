import type { NormalizedCart } from '$lib/stores/cart'
import { error, json } from '@sveltejs/kit'
import { authorize } from '$lib/auth'
import { InvoiceInDbSchema, OrderInDbSchema, OrderItemInDbSchema } from '$lib/schema'

import type { InvoiceMessage, OrderMessage } from '@plebeian/database'
import { db, eq, invoices, orderItems, orders, products, sql } from '@plebeian/database'

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
		await validateAndAuthorize(cartData, request)
	} catch (e) {
		throw error(401, 'Unauthorized')
	}

	try {
		await db.transaction(async (tx) => {
			const orderProductQuantities = new Map<string, Map<string, number>>()
			const orderInvoiceStatuses = new Map<string, string[]>()
			const insertedOrders = []
			const insertedOrderItems = []
			const insertedInvoices = []

			// Process Orders
			for (const order of Object.values(cartData.orders)) {
				const orderInDb = convertToOrderInDb(order)
				const [insertedOrder] = await tx.insert(orders).values(orderInDb).returning()
				insertedOrders.push(insertedOrder)

				const orderItemsInDb = convertToOrderItemsInDb(insertedOrder.id, order)
				const insertedOrderItem = await tx.insert(orderItems).values(orderItemsInDb).returning()
				insertedOrderItems.push(...insertedOrderItem)

				orderProductQuantities.set(insertedOrder.id, new Map(insertedOrderItem.map((item) => [item.productId, item.qty])))
				orderInvoiceStatuses.set(insertedOrder.id, [])
			}

			// Process Invoices
			for (const invoice of Object.values(cartData.invoices)) {
				const invoiceInDb = convertToInvoiceInDb(invoice)
				const [insertedInvoice] = await tx
					.insert(invoices)
					.values({
						...invoiceInDb,
						type: invoiceInDb.type,
						totalAmount: invoiceInDb.totalAmount.toString(),
					})
					.returning()
				insertedInvoices.push(insertedInvoice)

				orderInvoiceStatuses.get(insertedInvoice.orderId)?.push(insertedInvoice.invoiceStatus)
			}

			// Update Product Stocks
			for (const [orderId, invoiceStatuses] of orderInvoiceStatuses.entries()) {
				if (invoiceStatuses.every((status) => status === 'paid')) {
					const productQuantities = orderProductQuantities.get(orderId)
					if (productQuantities) {
						for (const [productId, qtyToReduce] of productQuantities.entries()) {
							await tx
								.update(products)
								.set({
									quantity: sql`${products.quantity} - ${qtyToReduce}`,
								})
								.where(eq(products.id, productId))
								.execute()
						}
					}
				}
			}

			return { insertedOrders, insertedOrderItems, insertedInvoices }
		})
		return json({ success: true })
	} catch (err) {
		console.error('Error persisting orders and invoices:', err)
		throw error(500, `Failed to persist orders and invoices: ${err}`)
	}
}

async function validateAndAuthorize(cartData: NormalizedCart, request: Request): Promise<void> {
	const orders = Object.values(cartData.orders)
	if (orders.length === 0) throw new Error('No orders found')

	const buyerUserId = orders[0].buyerUserId
	if (orders.some((order) => order.buyerUserId !== buyerUserId)) {
		throw new Error('Inconsistent buyerUserIds found')
	}

	await authorize(request, buyerUserId, 'POST')
}
// TODO: implement update product qty
// export const PUT = async ({ request }) => {

// }
