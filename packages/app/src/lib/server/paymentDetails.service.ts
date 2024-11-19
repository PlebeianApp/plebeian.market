import { error } from '@sveltejs/kit'
import { checkAddress, checkExtendedPublicKey, deriveAddresses, isExtendedPublicKey } from '$lib/utils/paymentDetails.utils'
import { LN_ADDRESS_REGEX } from '$lib/utils/zap.utils'

import type { PaymentDetail } from '@plebeian/database'
import { and, db, eq, isNull, or, paymentDetails } from '@plebeian/database'

import { getOnChainWalletDetails } from './wallet.service'

export type RichPaymentDetail = PaymentDetail & {
	stallName: string
}

const stallHasDefaultPaymentDetail = async (stallId: string): Promise<string | null> => {
	const [paymentDetailsByStall] = await db.query.paymentDetails.findMany({
		where: and(eq(paymentDetails.stallId, stallId), eq(paymentDetails.isDefault, true)),
	})

	if (!paymentDetailsByStall) return null

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
	if (detail.stallId) {
		const stall = await db.query.stalls.findFirst({
			where: (stalls) => (detail.stallId ? eq(stalls.id, detail.stallId) : undefined),
		})
		return {
			...detail,
			stallName: stall?.name || '',
		}
	} else {
		return {
			...detail,
			stallName: 'General',
		}
	}
}

const renderOnChainPaymentDetail = async (detail: PaymentDetail) => {
	const currentIndex = await getOnChainWalletDetails(detail.userId, detail.id)
	const currentAddress = deriveAddresses(detail.paymentDetails, 1, currentIndex?.valueNumeric ? Number(currentIndex.valueNumeric) : 0)
	if (!currentAddress) error(500, 'Could not derive address')
	return {
		...detail,
		paymentDetails: currentAddress[0],
	}
}

export const getPaymentDetailsByUserId = async (userId: string): Promise<RichPaymentDetail[]> => {
	const details = await db.query.paymentDetails.findMany({
		where: eq(paymentDetails.userId, userId),
	})

	const processDetail = async (detail: PaymentDetail) => {
		switch (detail.paymentMethod) {
			case 'ln':
				return LN_ADDRESS_REGEX.test(detail.paymentDetails) ? detail : null
			case 'on-chain':
				if (checkExtendedPublicKey(detail.paymentDetails)) {
					return renderOnChainPaymentDetail(detail)
				}
				if (checkAddress(detail.paymentDetails)) {
					return detail
				}
				return null
			default:
				return null
		}
	}

	const validDetails = (await Promise.all(details.map(processDetail))).filter((detail): detail is RichPaymentDetail => detail !== null)

	return Promise.all(validDetails.map(enrichWithStallName))
}

export const getPrivatePaymentDetailsByUserId = async (userId: string): Promise<RichPaymentDetail[]> => {
	const details = await db.query.paymentDetails.findMany({
		where: eq(paymentDetails.userId, userId),
	})
	return await Promise.all(details.map(enrichWithStallName))
}

export const createPaymentDetail = async (paymentDetail: PaymentDetail): Promise<RichPaymentDetail> => {
	const intentToSetDefault = paymentDetail.stallId ? !!paymentDetail.isDefault : false

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
	const intentToSetDefault = paymentDetail.stallId ? !!paymentDetail.isDefault : false

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

export const getPaymentDetailsByStallId = async (stallId: string): Promise<RichPaymentDetail[]> => {
	const paymentDetailsForStall = await db.query.paymentDetails.findMany({
		where: or(eq(paymentDetails.stallId, stallId), isNull(paymentDetails.stallId)),
	})
	return await Promise.all(paymentDetailsForStall.map(enrichWithStallName))
}

export const setDefaultPaymentDetail = async (paymentDetailId: string, stallId: string): Promise<RichPaymentDetail> => {
	const targetStall = await db.query.stalls.findFirst({
		where: (stalls) => eq(stalls.id, stallId),
	})

	if (!targetStall) {
		error(404, 'Stall not found')
	}

	await unsetDefaultsForStall(targetStall.id)

	const [updatedPaymentDetail] = await db
		.update(paymentDetails)
		.set({ isDefault: true })
		.where(eq(paymentDetails.id, paymentDetailId))
		.returning()

	return enrichWithStallName(updatedPaymentDetail)
}

export const countPaymentDetailsByUserId = async (userId: string): Promise<number> => {
	const exists = await db.$count(paymentDetails, eq(paymentDetails.userId, userId))
	return exists
}
