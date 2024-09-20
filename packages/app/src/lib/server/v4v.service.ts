import { and, db, eq, USER_META, userMeta } from '@plebeian/database'

export type V4VShare = {
	amount: number
	target: string
}

export const getV4VPlatformShareForUser = async (decodedOwnerPk: string) => {
	const platformShares = await db
		.select()
		.from(userMeta)
		.where(and(eq(userMeta.metaName, USER_META.V4V_SHARE.value), eq(userMeta.userId, decodedOwnerPk)))
		.execute()

	return platformShares.map((platformShare) => ({
		amount: platformShare.valueNumeric,
		target: platformShare.key,
	}))
}

export const setV4VSharesForUser = async (decodedOwnerPk: string, shares: V4VShare[]) => {
	try {
		await db.transaction(async (trx) => {
			await trx
				.delete(userMeta)
				.where(and(eq(userMeta.userId, decodedOwnerPk), eq(userMeta.metaName, USER_META.V4V_SHARE.value)))
				.execute()

			const newShares = shares.map((share) => ({
				userId: decodedOwnerPk,
				metaName: USER_META.V4V_SHARE.value,
				valueNumeric: share.amount,
				key: share.target,
			}))

			await trx.insert(userMeta).values(newShares).execute()
		})

		return shares.reduce((sum, share) => sum + share.amount, 0)
	} catch (e) {
		console.error('Error in setV4VSharesForUser:', e)
		throw e
	}
}
