import { error } from '@sveltejs/kit'
import { nwcUriToWalletDetails, walletDetailsToNWCUri } from '$lib/utils'

import type { WalletType } from '@plebeian/database'
import { and, db, eq, USER_META, userMeta, WALLET_TYPE } from '@plebeian/database'

export type NWCWallet = {
	walletPubKey: string
	walletRelays: string[]
	walletSecret: string
}

export type OnChainIndexWallet = {
	paymentDetailId: string
	index: number
}

export type DisplayWallet = {
	id: string
	userId: string
	walletType: WalletType
	walletDetails: NWCWallet | OnChainIndexWallet
}

export const getNwcWalletsByUserId = async (userId: string) => {
	const userWallets = await db
		.select()
		.from(userMeta)
		.where(and(eq(userMeta.metaName, USER_META.WALLET_DETAILS.value), eq(userMeta.userId, userId)))
		.execute()
	return userWallets.map((wallet) => {
		if (wallet.key === 'nwc') {
			return {
				id: wallet.id,
				wallet: wallet.userId,
				walletType: WALLET_TYPE.NWC,
				walletDetails: nwcUriToWalletDetails(wallet.valueText as string),
			}
		}
	})
}

export const postWalletForUser = async (walletType: WalletType, userId: string, walletDetails: NWCWallet | OnChainIndexWallet) => {
	try {
		let valueText: string
		let valueNumeric: number | null = null

		if (walletType === WALLET_TYPE.NWC) {
			valueText = walletDetailsToNWCUri(walletDetails as NWCWallet)
		} else if (walletType === WALLET_TYPE.ON_CHAIN_INDEX) {
			const onChainDetails = walletDetails as OnChainIndexWallet
			valueText = onChainDetails.paymentDetailId
			valueNumeric = onChainDetails.index
		} else {
			throw new Error('Invalid wallet type')
		}

		const [result] = await db
			.insert(userMeta)
			.values({
				userId: userId,
				metaName: USER_META.WALLET_DETAILS.value,
				key: walletType,
				valueText: valueText,
				valueNumeric: valueNumeric !== null ? valueNumeric.toString() : null,
			})
			.returning()

		if (!result) {
			throw new Error('Failed to insert wallet')
		}

		return result
	} catch (e) {
		console.error(e)
		throw error(500, `Failed to create wallet for user ${userId}. Reason: ${e}`)
	}
}

export const updateWalletForUser = async (walletId: string, userId: string, walletDetails: NWCWallet) => {
	try {
		const [result] = await db
			.update(userMeta)
			.set({
				valueText: walletDetailsToNWCUri(walletDetails),
			})
			.where(and(eq(userMeta.metaName, USER_META.WALLET_DETAILS.value), eq(userMeta.userId, userId), eq(userMeta.id, walletId)))
			.returning()

		if (!result) {
			throw new Error('Failed to update wallet')
		}

		return result
	} catch (e) {
		console.error(e)
		throw error(500, `Failed to create wallet for user ${userId}. Reason: ${e}`)
	}
}

export const deleteWalletForUser = async (userId: string, walletId: string) => {
	try {
		const [result] = await db
			.delete(userMeta)
			.where(and(eq(userMeta.metaName, USER_META.WALLET_DETAILS.value), eq(userMeta.userId, userId), eq(userMeta.id, walletId)))
			.returning()

		if (!result) {
			throw new Error('Failed to delete wallet')
		}

		return result
	} catch (e) {
		console.error(e)
		throw error(500, `Failed to delete wallet for user ${userId}. Reason: ${e}`)
	}
}

export const deleteWalletForUserByPaymentDetailId = async (userId: string, paymentDetailId: string) => {
	try {
		const [result] = await db
			.delete(userMeta)
			.where(
				and(
					eq(userMeta.metaName, USER_META.WALLET_DETAILS.value),
					eq(userMeta.userId, userId),
					eq(userMeta.key, WALLET_TYPE.ON_CHAIN_INDEX),
					eq(userMeta.valueText, paymentDetailId),
				),
			)
			.returning()

		if (!result) {
			throw new Error('Failed to delete wallet')
		}

		return result
	} catch (e) {
		console.error(e)
		throw error(500, `Failed to delete wallet for user ${userId} and payment detail ${paymentDetailId}. Reason: ${e}`)
	}
}

export const getOnChainIndexForPaymentDetail = async (userId: string, paymentDetailId: string): Promise<number> => {
	const [result] = await db
		.select()
		.from(userMeta)
		.where(
			and(
				eq(userMeta.metaName, USER_META.WALLET_DETAILS.value),
				eq(userMeta.userId, userId),
				eq(userMeta.key, WALLET_TYPE.ON_CHAIN_INDEX),
				eq(userMeta.valueText, paymentDetailId),
			),
		)
		.execute()

	if (!result) {
		return 0
	}

	return Number(result.valueNumeric)
}

export const incrementOnChainIndex = async (userId: string, paymentDetailId: string): Promise<number> => {
	const currentIndex = await getOnChainIndexForPaymentDetail(userId, paymentDetailId)
	const newIndex = currentIndex + 1

	await db
		.update(userMeta)
		.set({
			valueNumeric: String(newIndex),
		})
		.where(and(eq(userMeta.metaName, USER_META.WALLET_DETAILS.value), eq(userMeta.userId, userId), eq(userMeta.valueText, paymentDetailId)))
		.returning()

	return newIndex
}
