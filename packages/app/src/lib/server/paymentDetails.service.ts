import type { PaymentDetail } from '@plebeian/database'
import { db, eq, paymentDetails } from '@plebeian/database'

export type RichPaymentDetail = PaymentDetail & {
	stallName: string
}

// Enrichment function to add stall name to payment detail
const enrichWithStallName = async (detail: PaymentDetail): Promise<RichPaymentDetail> => {
	const stall = await db.query.stalls.findFirst({
		where: (stalls) => eq(stalls.id, detail.stallId),
	})
	return {
		...detail,
		stallName: stall?.name || '',
	}
}

export const getPaymentDetailsByUserId = async (userId: string): Promise<RichPaymentDetail[]> => {
	const details = await db.query.paymentDetails.findMany({
		where: eq(paymentDetails.userId, userId),
	})

	return await Promise.all(details.map(enrichWithStallName))
}

export const createPaymentDetail = async (paymentDetail: PaymentDetail): Promise<RichPaymentDetail> => {
	const [newPaymentDetails] = await db.insert(paymentDetails).values(paymentDetail).returning()
	return enrichWithStallName(newPaymentDetails)
}

export const updatePaymentDetail = async (paymentDetailId: string, paymentDetail: PaymentDetail): Promise<RichPaymentDetail> => {
	const [updatedPaymentDetail] = await db
		.update(paymentDetails)
		.set(paymentDetail)
		.where(eq(paymentDetails.id, paymentDetailId))
		.returning()
	return enrichWithStallName(updatedPaymentDetail)
}

export const deletePaymentDetail = async (paymentDetailId: string): Promise<boolean> => {
	const [deleted] = await db.delete(paymentDetails).where(eq(paymentDetails.id, paymentDetailId)).returning()
	return !!deleted
}
