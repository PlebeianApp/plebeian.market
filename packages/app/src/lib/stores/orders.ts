import type { DisplayInvoice } from '$lib/server/invoices.service'
import type { DisplayOrder } from '$lib/server/orders.service'
import { get, writable } from 'svelte/store'

import type { InvoiceMessage, OrderMessage, OrderStatus, OrderStatusUpdateMessage } from '@plebeian/database'

function createOrdersStore() {
	const { subscribe, update, set } = writable<Map<string, DisplayOrder>>(new Map())

	return {
		subscribe,
		set,
		addOrder: (orderMessage: OrderMessage) => {
			update((orders) => {
				const displayOrder: DisplayOrder = {
					id: orderMessage.id,
					createdAt: new Date(orderMessage.createdAt || Date.now()),
					updatedAt: new Date(orderMessage.updatedAt || Date.now()),
					sellerUserId: orderMessage.sellerUserId,
					buyerUserId: orderMessage.buyerUserId,
					status: orderMessage.status,
					shippingId: orderMessage.shippingId,
					stallId: orderMessage.stallId,
					address: orderMessage.address,
					zip: orderMessage.zip,
					city: orderMessage.city,
					country: orderMessage.country,
					region: orderMessage.region ?? null,
					contactName: orderMessage.contactName,
					contactPhone: orderMessage.contactPhone ?? null,
					contactEmail: orderMessage.contactEmail ?? null,
					additionalInfo: orderMessage.additionalInfo ?? null,
					orderItems: orderMessage.items.map((item) => ({
						productId: item.product_id,
						qty: item.quantity,
					})),
				}
				console.log('looking diplsay order', displayOrder)
				orders.set(orderMessage.id, displayOrder)
				return orders
			})
		},
		updateStatusByMsg: (statusUpdate: OrderStatusUpdateMessage) => {
			update((orders) => {
				const order = orders.get(statusUpdate.id)
				if (order) {
					orders.set(statusUpdate.id, {
						...order,
						status: statusUpdate.status,
						updatedAt: new Date(),
					})
				}
				return orders
			})
		},
		updateStatus: (orderId: string, status: OrderStatus) => {
			update((orders) => {
				const order = orders.get(orderId)
				if (order) {
					orders.set(orderId, {
						...order,
						status,
						updatedAt: new Date(),
					})
				}
				return orders
			})
		},
		getOrder: (orderId: string) => {
			let result: DisplayOrder | undefined
			subscribe((orders) => {
				result = orders.get(orderId)
			})()
			return result
		},
		clear: () => set(new Map()),
	}
}

export const ordersStore = createOrdersStore()

function createInvoicesStore() {
	const { subscribe, update, set } = writable<Map<string, DisplayInvoice[]>>(new Map())

	return {
		subscribe,
		set,
		addInvoice: (invoice: InvoiceMessage) => {
			update((invoices) => {
				const orderInvoices = invoices.get(invoice.orderId) || []
				const displayInvoice: DisplayInvoice = {
					id: invoice.id,
					createdAt: String(invoice.createdAt),
					updatedAt: String(invoice.updatedAt),
					orderId: invoice.orderId,
					totalAmount: invoice.totalAmount.toString(),
					invoiceStatus: invoice.invoiceStatus ?? 'pending',
					type: invoice.type,
					paymentDetails: invoice.paymentId,
					observations: invoice.proof,
				}

				// Check if invoice already exists, if so update it
				const existingIndex = orderInvoices.findIndex((i) => i.id === invoice.id)
				if (existingIndex !== -1) {
					orderInvoices[existingIndex] = displayInvoice
				} else {
					orderInvoices.push(displayInvoice)
				}

				invoices.set(invoice.orderId, orderInvoices)
				return invoices
			})
		},
		getInvoicesByOrderId: (orderId: string) => {
			const orders = get(invoicesStore)
			return orders.get(orderId) || []
		},
		clear: () => set(new Map()),
	}
}

export const invoicesStore = createInvoicesStore()
