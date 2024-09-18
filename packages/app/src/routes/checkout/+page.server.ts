// src/routes/checkout/+page.server.ts
import type { InvoiceInDb, OrderInDb, OrderItemInDb } from '$lib/schema'
import type { CartInvoice, NormalizedCart } from '$lib/stores/cart'
import { error } from '@sveltejs/kit'
import { InvoiceInDbSchema, OrderInDbSchema, OrderItemInDbSchema } from '$lib/schema'

import type { OrderMessage } from '@plebeian/database'
import { db, invoices, orderItems, orders } from '@plebeian/database'

import type { Actions } from './$types'

function convertToOrderInDb(order: OrderMessage): OrderInDb {
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

function convertToOrderItemsInDb(orderId: string, order: OrderMessage): OrderItemInDb[] {
	return order.items.map((item) =>
		OrderItemInDbSchema.parse({
			orderId,
			productId: item.product_id,
			qty: item.quantity,
		}),
	)
}

function convertToInvoiceInDb(invoice: CartInvoice): InvoiceInDb {
	return InvoiceInDbSchema.parse({
		...invoice,
		createdAt: new Date(invoice.createdAt),
		updatedAt: new Date(invoice.updatedAt),
		paymentDetails: invoice.paymentId,
	})
}

export const actions = {
	persistOrdersAndInvoices: async ({ request }) => {
		const cartData: NormalizedCart = JSON.parse((await request.formData()).get('cartData') as string)

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
						totalAmount: invoiceInDb.totalAmount.toString(),
					})
					insertedInvoices.push(insertedInvoice)
				}

				return { insertedOrders, insertedOrderItems, insertedInvoices }
			})

			return { success: true, result }
		} catch (err) {
			console.error('Error persisting orders and invoices:', err)
			throw error(500, { message: `Failed to persist orders and invoices: ${err}` })
		}
	},
} satisfies Actions
