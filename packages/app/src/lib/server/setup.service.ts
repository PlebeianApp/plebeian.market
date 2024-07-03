import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { decodePk } from '$lib/utils'

import type { NewAppSettings, UserRoles } from '@plebeian/database'
import { appSettings, db, eq, sql, USER_META, USER_ROLES, userMeta, users } from '@plebeian/database'

import { getUsersByRole } from './users.service'

export type ExtendedAppSettings = NewAppSettings & {
	adminsList?: string[]
}

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select({ isFirstTimeRunning: appSettings.isFirstTimeRunning }).from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const getAppSettings = async () => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes
}

const adminsToSync = async (appSettingsData: ExtendedAppSettings) => {
	try {
		const decodedOwnerPk = decodePk(appSettingsData.ownerPk)
		const desiredAdmins = [
			...(decodedOwnerPk ? [{ id: decodedOwnerPk }] : []),
			...(appSettingsData.adminsList?.map((adminPk) => ({
				id: decodePk(adminPk),
			})) ?? []),
		].filter((admin) => admin?.id !== null)

		const currentAdminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }))

		const newAdmins = desiredAdmins.filter((admin) => !currentAdminUsers.includes(admin.id))
		const removedAdmins = currentAdminUsers.filter((user) => !desiredAdmins.some((admin) => admin.id === user))

		await Promise.all([
			newAdmins.length ? insertUsers(newAdmins) : Promise.resolve(),
			removedAdmins.length ? revokeAdmins(removedAdmins) : Promise.resolve(),
		])
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
