import { error } from '@sveltejs/kit'

import { and, db, eq, USER_META, userMeta } from '@plebeian/database'

export const setV4VPlatformShareForUserByTarget = async (v4vShare: number, decodedOwnerPk: string, shareTarget: string) => {
	try {
		const existingRecord = await db
			.select()
			.from(userMeta)
			.where(and(eq(userMeta.metaName, USER_META.V4V_SHARE.value), eq(userMeta.userId, decodedOwnerPk), eq(userMeta.key, shareTarget)))
			.execute()

		let result

		if (existingRecord.length > 0) {
			result = await db
				.update(userMeta)
				.set({
					valueNumeric: v4vShare.toString(),
				})
				.where(and(eq(userMeta.metaName, USER_META.V4V_SHARE.value), eq(userMeta.userId, decodedOwnerPk), eq(userMeta.key, shareTarget)))
				.returning()
		} else {
			// Insert new record
			result = await db
				.insert(userMeta)
				.values({
					userId: decodedOwnerPk,
					metaName: USER_META.V4V_SHARE.value,
					key: shareTarget,
					valueNumeric: v4vShare.toString(),
				})
				.returning()
		}

		if (result.length === 0) {
			throw new Error('Failed to insert or update platform share')
		}

		return result[0].valueNumeric
	} catch (e) {
		console.error(e)
		throw error(500, `Failed to set platform share for user ${decodedOwnerPk}. Reason: ${e}`)
	}
}

export const getV4VPlatformShareForUserByTarget = async (decodedOwnerPk: string, target: string) => {
	const [platformShare] = await db
		.select()
		.from(userMeta)
		.where(and(eq(userMeta.metaName, USER_META.V4V_SHARE.value), eq(userMeta.userId, decodedOwnerPk), eq(userMeta.key, target)))
		.execute()

	if (!platformShare) {
		throw error(404, `Platform share not found for user ${decodedOwnerPk} and target ${target}`)
	}

	return platformShare.valueNumeric
}
