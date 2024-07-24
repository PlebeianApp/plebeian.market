import { error } from '@sveltejs/kit'

import { and, db, eq, USER_META, userMeta } from '@plebeian/database'

export const setV4VPlatformShareForUser = async (v4vPlatformShare: number, decodedOwnerPk: string) => {
	try {
		const [platformShare] = await db
			.update(userMeta)
			.set({ valueNumeric: v4vPlatformShare.toString() })
			.where(and(eq(userMeta.metaName, USER_META.PLATFORM_SHARE.value), eq(userMeta.userId, decodedOwnerPk)))
			.returning()

		return platformShare.valueNumeric
	} catch (e) {
		console.log(e)
		error(500, `Failed to set platform share for user ${decodedOwnerPk}. Reason ${e}`)
	}
}

export const getV4VPlatformShareForUser = async (decodedOwnerPk: string) => {
	const [platformShare] = await db
		.select()
		.from(userMeta)
		.where(and(eq(userMeta.metaName, USER_META.PLATFORM_SHARE.value), eq(userMeta.userId, decodedOwnerPk)))
		.execute()

	if (!platformShare) {
		error(500, `Failed to get platform share for user ${decodedOwnerPk}`)
	}

	return platformShare.valueNumeric
}
