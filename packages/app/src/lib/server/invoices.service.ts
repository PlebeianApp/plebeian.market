import type { InvoicesFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { standardDisplayDateFormat } from '$lib/constants'
import { formatSats } from '$lib/utils'
import { format } from 'date-fns'

import type { Invoice, InvoiceStatus } from '@plebeian/database'
import { db, eq, invoices, orders } from '@plebeian/database'

export type DisplayInvoice = Pick<
	Invoice,
	'id' | 'orderId' | 'totalAmount' | 'invoiceStatus' | 'type' | 'paymentDetails' | 'observations'
> & {
	createdAt: string
	updatedAt: string
}

const toDisplayInvoice = (invoice: Invoice): DisplayInvoice => {
	return {
		...invoice,
		totalAmount: formatSats(parseFloat(invoice.totalAmount), false).toString(),
		createdAt: format(invoice.createdAt, standardDisplayDateFormat),
		updatedAt: format(invoice.updatedAt, standardDisplayDateFormat),
	}
}

export const getInvoiceById = async (invoiceId: string): Promise<DisplayInvoice> => {
	const [invoiceResult] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).execute()

	if (!invoiceResult) {
		error(404, 'Invoice not found')
	}

	return toDisplayInvoice(invoiceResult)
}

export const getInvoicesByOrderId = async (filter: InvoicesFilter): Promise<DisplayInvoice[]> => {
	const invoicesResult = await db.select().from(invoices).where(eq(invoices.orderId, filter.orderId!)).execute()
	if (!invoicesResult.length) {
		error(404, 'No invoices found for this order')
	}

	return invoicesResult.map(toDisplayInvoice)
}

export const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisplayInvoice> => {
	const [order] = await db.select().from(orders).where(eq(orders.id, invoice.orderId)).execute()

	if (!order) {
		error(404, 'Order not found')
	}

	const [newInvoice] = await db
		.insert(invoices)
		.values({
			...invoice,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning()

	if (!newInvoice) {
		error(500, 'Failed to create invoice')
	}

	return toDisplayInvoice(newInvoice)
}

export const updateInvoiceObservations = async (invoiceId: string, observations: string, userId: string): Promise<DisplayInvoice> => {
	const [invoiceRes] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).execute()
	const [orderRes] = await db
		.select({
			buyerId: orders.buyerUserId,
			sellerId: orders.sellerUserId,
		})
		.from(orders)
		.where(eq(orders.id, invoiceRes.orderId))
		.execute()

	const { buyerId, sellerId } = orderRes

	if (userId !== buyerId && userId !== sellerId) {
		error(401, 'Unauthorized')
	}

	const [updatedInvoice] = await db
		.update(invoices)
		.set({ observations, updatedAt: new Date() })
		.where(eq(invoices.id, invoiceId))
		.returning()

	if (!updatedInvoice) {
		error(404, 'Invoice not found')
	}

	return toDisplayInvoice(updatedInvoice)
}

export const updateInvoiceStatus = async (invoiceId: string, newStatus: InvoiceStatus, userId: string): Promise<DisplayInvoice> => {
	const [invoiceRes] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).execute()
	const [orderRes] = await db
		.select({
			buyerId: orders.buyerUserId,
			sellerId: orders.sellerUserId,
		})
		.from(orders)
		.where(eq(orders.id, invoiceRes.orderId))
		.execute()

	const { buyerId, sellerId } = orderRes

	if (userId !== buyerId && userId !== sellerId) {
		error(401, 'Unauthorized')
	}

	const [updatedInvoice] = await db
		.update(invoices)
		.set({ invoiceStatus: newStatus, updatedAt: new Date() })
		.where(eq(invoices.id, invoiceId))
		.returning()

	if (!updatedInvoice) {
		error(404, 'Invoice not found')
	}

	return toDisplayInvoice(updatedInvoice)
}
