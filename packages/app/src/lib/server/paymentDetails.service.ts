import type { PaymentDetail } from '@plebeian/database'
import { db, eq, paymentDetails } from '@plebeian/database'

export const getPaymentDetailsByUserId = async (userId: string): Promise<PaymentDetail[]> => {
	return await db.query.paymentDetails.findMany({
		where: eq(paymentDetails.userId, userId),
	})
}

export const createPaymentDetail = async (paymentDetail: PaymentDetail): Promise<PaymentDetail> => {
	const [newPaymentDetails] = await db.insert(paymentDetails).values(paymentDetail).returning()
	return newPaymentDetails
}

export const deletePaymentDetail = async (paymentDetailId: string): Promise<boolean> => {
	const [deleted] = await db.delete(paymentDetails).where(eq(paymentDetails.id, paymentDetailId)).returning()
	return !!deleted
}
