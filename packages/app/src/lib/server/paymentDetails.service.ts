import type { PaymentDetail } from '@plebeian/database'
import { and, db, eq, paymentDetails } from '@plebeian/database'

export type RichPaymentDetail = PaymentDetail & {
	stallName: string
}

const stallHasDefaultPaymentDetail = async (stallId: string): Promise<string | null> => {
	const [paymentDetailsByStall] = await db.query.paymentDetails.findMany({
		where: and(eq(paymentDetails.stallId, stallId), eq(paymentDetails.isDefault, true)),
	})
	return paymentDetailsByStall.id || null
}

const unsetDefaultsForStall = async (stallId: string): Promise<void> => {
	const paymentDetailsByStall = await db.query.paymentDetails.findMany({
		where: eq(paymentDetails.stallId, stallId),
	})

	await Promise.all(
		paymentDetailsByStall.map((pd) =>
			db
				.update(paymentDetails)
				.set({ isDefault: false })
				.where(and(eq(paymentDetails.id, pd.id), eq(paymentDetails.isDefault, true))),
		),
	)
}

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
	const intentToSetDefault = paymentDetail.stallId ? (paymentDetail.isDefault ? true : false) : false

	if (intentToSetDefault && paymentDetail.stallId) {
		const defaultPaymentDetailId = await stallHasDefaultPaymentDetail(paymentDetail.stallId)
		if (defaultPaymentDetailId) {
			await unsetDefaultsForStall(paymentDetail.stallId)
		}
	}

	const [newPaymentDetails] = await db.insert(paymentDetails).values(paymentDetail).returning()
	return enrichWithStallName(newPaymentDetails)
}

export const updatePaymentDetail = async (paymentDetailId: string, paymentDetail: PaymentDetail): Promise<RichPaymentDetail> => {
	const intentToSetDefault = paymentDetail.stallId ? (paymentDetail.isDefault ? true : false) : false

	if (intentToSetDefault && paymentDetail.stallId) {
		const defaultPaymentDetailId = await stallHasDefaultPaymentDetail(paymentDetail.stallId)
		if (defaultPaymentDetailId) {
			await unsetDefaultsForStall(paymentDetail.stallId)
		}
	}

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
