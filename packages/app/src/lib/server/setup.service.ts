import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { decodePk } from '$lib/utils'

import type { AppSettings, NewAppSettings, UserRoles } from '@plebeian/database'
import {
	appSettings,
	db,
	eq,
	INITIAL_V4V_PM_SHARE_PERCENTAGE,
	PM_NPUB,
	sql,
	USER_META,
	USER_ROLES,
	userMeta,
	users,
} from '@plebeian/database'

import { getUsersByRole } from './users.service'
import { setV4VSharesForUser } from './v4v.service'

export type ExtendedAppSettings = NewAppSettings & {
	adminsList?: string[]
}

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select({ isFirstTimeRunning: appSettings.isFirstTimeRunning }).from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const getAppSettings = async (): Promise<AppSettings | undefined> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes
}

const adminsToSync = async (appSettingsData: ExtendedAppSettings) => {
	try {
		const desiredAdminIds = new Set(
			[appSettingsData.ownerPk, ...(appSettingsData.adminsList || [])].map(decodePk).filter((id): id is string => Boolean(id)),
		)

		const currentAdminUsers = new Set(await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN })))

		const newAdminIds = [...desiredAdminIds].filter((id) => !currentAdminUsers.has(id))
		const removedAdminIds = [...currentAdminUsers].filter((id) => !desiredAdminIds.has(id))

		const operations = [
			...newAdminIds.flatMap((id) => [
				insertUsers([{ id }]),
				setV4VSharesForUser(id, [{ amount: INITIAL_V4V_PM_SHARE_PERCENTAGE, target: PM_NPUB }]),
			]),
			...(removedAdminIds.length ? [revokeAdmins(removedAdminIds)] : []),
		]

		if (operations.length > 0) {
			await Promise.all(operations)
		}
	} catch (e) {
		error(500, { message: `Error in adminsToSync: ${e}` })
	}
}

const revokeAdmins = async (users: string[]) => {
	try {
		await Promise.allSettled(
			users.map(async (user) => {
				await db.update(userMeta).set({ valueText: USER_ROLES.PLEB }).where(eq(userMeta.userId, user)).execute()
			}),
		)
	} catch (e) {
		error(500, { message: `Error in revokeAdmins: ${e}` })
	}
}

export type UpdateAppSettingsReturnType = Awaited<ReturnType<typeof updateAppSettings>>

export const updateAppSettings = async (appSettingsData: ExtendedAppSettings) => {
	try {
		const decodedInstancePk = decodePk(appSettingsData.instancePk)
		const decodedOwnerPk = decodePk(appSettingsData?.ownerPk)

		const [appSettingsRes] = await db
			.update(appSettings)
			.set({
				...appSettingsData,
				instancePk: decodedInstancePk,
				ownerPk: decodedOwnerPk,
				isFirstTimeRunning: false,
				allowRegister: JSON.parse(appSettingsData.allowRegister as unknown as string),
				updatedAt: new Date(),
			})
			.where(appSettingsData.isFirstTimeRunning ? eq(appSettings.isFirstTimeRunning, true) : eq(appSettings.instancePk, decodedInstancePk))
			.returning()
			.execute()

		if (!appSettingsRes) {
			error(500, { message: `Failed to update app settings` })
		}

		if (appSettingsData.adminsList || appSettingsData.ownerPk) {
			const insertedUsers = await adminsToSync(appSettingsData)
			return { appSettingsRes, insertedUsers }
		}

		return { appSettingsRes }
	} catch (e) {
		error(500, { message: `${e}` })
	}
}

const insertUsers = async (usersToInsert: { id: string }[]): Promise<ReturnType<(typeof db)['insert']>[]> => {
	db.run(sql`PRAGMA foreign_keys = OFF;`)
	const result = await db.transaction(async (trx) => {
		try {
			const insertedUsers = await trx.insert(users).values(usersToInsert).returning({ id: users.id })

			if (!insertedUsers.length) {
				throw 'Failed to insert user or get user ID'
			}
			const userMetaValues = insertedUsers.map((user) => ({
				userId: user.id,
				metaName: USER_META.ROLE.value,
				valueText: 'admin' as UserRoles,
			}))

			await trx.insert(userMeta).values(userMetaValues).execute()

			return insertedUsers
		} catch (e) {
			trx.rollback()
			error(500, { message: `Error in transaction: ${e}` })
		} finally {
			db.run(sql`PRAGMA foreign_keys = ON;`)
		}
	})
	return result.filter(Boolean) as unknown as ReturnType<(typeof db)['insert']>[]
}
