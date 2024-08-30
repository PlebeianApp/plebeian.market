import { error } from '@sveltejs/kit'

import type { WalletType } from '@plebeian/database'
import { and, db, eq, USER_META, userMeta, WALLET_TYPE } from '@plebeian/database'

export type NWCWallet = {
	walletPubKey: string
	walletRelay: string
	walletSecret: string
}

export type DisplayWallet = {
	id: string
	userId: string
	walletType: WalletType
	walletDetails: NWCWallet
}

const walletDetailsToNWCWallet = (walletDetails: string): NWCWallet => {
	const walletData = walletDetails.split('://')[1]
	const [walletPubKey, relayAndSecret] = walletData.split('?')
	const [relay, secret] = relayAndSecret.split('&')

	const decodedRelay = decodeURIComponent(relay.split('=')[1])

	return {
		walletPubKey,
		walletRelay: decodedRelay,
		walletSecret: secret.split('=')[1],
	}
}

export const getWalletsByUserId = async (userId: string) => {
	const userWallets = await db
		.select()
		.from(userMeta)
		.where(and(eq(userMeta.metaName, USER_META.WALLET_DETAILS.value), eq(userMeta.userId, userId)))
		.execute()

	return userWallets.map((wallet) => {
		if (wallet.key === 'nwc') {
			const details = walletDetailsToNWCWallet(wallet.valueText ?? '')
			return {
				id: wallet.id,
				userId: wallet.userId,
				walletType: WALLET_TYPE.NWC,
				walletDetails: walletDetailsToNWCWallet(wallet.valueText ?? ''),
			}
		}
	})
}

export const postWalletForUser = async (walletType: WalletType, userId: string, walletDetails: NWCWallet) => {
	const constructedNwc = `nostr+walletconnect://${walletDetails.walletPubKey}?relay=${encodeURIComponent(walletDetails.walletRelay)}&secret=${walletDetails.walletSecret}`
	try {
		const [result] = await db
			.insert(userMeta)
			.values({
				userId: userId,
				metaName: USER_META.WALLET_DETAILS.value,
				key: walletType,
				valueText: constructedNwc,
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
	const constructedNwc = `nostr+walletconnect://${walletDetails.walletPubKey}?relay=${encodeURIComponent(walletDetails.walletRelay)}&secret=${walletDetails.walletSecret}`
	try {
		const [result] = await db
			.update(userMeta)
			.set({
				valueText: constructedNwc,
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

export const deleteWalletForUser = async (walletId: string, userId: string) => {
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
