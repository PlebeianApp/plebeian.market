import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { decode } from 'nostr-tools/nip19'

import type { NewAppSettings, UserRoles } from '@plebeian/database'
import { appSettings, db, eq, USER_META, USER_ROLES, userMeta, users } from '@plebeian/database'

import { getUsersByRole } from './users.service'

export type ExtendedAppSettings = NewAppSettings & {
	adminsList: string[]
}

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const getAppSettings = async () => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes
}

export const doSetup = async (setupData: ExtendedAppSettings) => {
	if (!setupData.instancePk) {
		error(400, 'Invalid request')
	}

	const decodedInstancePk = setupData.instancePk.startsWith('npub') ? decode(setupData.instancePk).data.toString() : setupData.instancePk
	const decodedOwnerPk = setupData.ownerPk ? decode(setupData.ownerPk).data.toString() : null

	const updatedAppSettings = await updateAppSettings({
		...setupData,
		isFirstTimeRunning: true,
		instancePk: decodedInstancePk,
		defaultCurrency: setupData.defaultCurrency,
		ownerPk: decodedOwnerPk,
		allowRegister: JSON.parse(setupData.allowRegister as unknown as string),
	})

	const insertedUsers = adminsToInsert(setupData)

	return { updatedAppSettings, insertedUsers }
}

const adminsToInsert = async (appSettingsData: ExtendedAppSettings) => {
	const decodedInstancePk = appSettingsData.instancePk.startsWith('npub')
		? decode(appSettingsData.instancePk).data.toString()
		: appSettingsData.instancePk
	const decodedOwnerPk = appSettingsData.ownerPk ? decode(appSettingsData.ownerPk).data.toString() : null

	const adminsToInsert = [
		...(decodedInstancePk ? [{ id: decodedInstancePk, role: USER_ROLES.ADMIN }] : []),
		...(decodedOwnerPk ? [{ id: decodedOwnerPk, role: USER_ROLES.ADMIN }] : []),
		...(appSettingsData.adminsList?.map((adminPk) => ({
			id: decode(adminPk).data.toString(),
			role: USER_ROLES.ADMIN,
		})) ?? []),
	].filter((admin) => admin?.id !== null)

	const currentAdminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }))

	const usersToInsert = adminsToInsert.filter((admin) => !currentAdminUsers.includes(admin.id))

	const insertedUsers = await insertUsers(usersToInsert)

	await revokeAdmins(adminsToInsert, currentAdminUsers)

	return insertedUsers
}

const revokeAdmins = async (adminsToInsert: { id: string; role: UserRoles }[], currentAdminUsers: string[]) => {
	const revokedAdminUsers = currentAdminUsers.filter((user) => !adminsToInsert.some((admin) => admin.id === user))
	await Promise.all(
		revokedAdminUsers.map(async (user) => {
			await db.update(userMeta).set({ valueText: USER_ROLES.PLEB }).where(eq(userMeta.userId, user)).execute()
		}),
	)
}

export type UpdateAppSettingsReturnType = Awaited<ReturnType<typeof updateAppSettings>>

export const updateAppSettings = async (appSettingsData: ExtendedAppSettings) => {
	const decodedInstancePk = appSettingsData.instancePk.startsWith('npub')
		? decode(appSettingsData.instancePk).data.toString()
		: appSettingsData.instancePk
	const decodedOwnerPk = appSettingsData.ownerPk ? decode(appSettingsData.ownerPk).data.toString() : null

	const [appSettingsRes] = await db
		.update(appSettings)
		.set({
			...appSettingsData,
			isFirstTimeRunning: false,
			instancePk: decodedInstancePk,
			ownerPk: decodedOwnerPk,
			allowRegister: JSON.parse(appSettingsData.allowRegister as unknown as string),
		})
		.where(appSettingsData.isFirstTimeRunning ? eq(appSettings.isFirstTimeRunning, true) : eq(appSettings.instancePk, decodedInstancePk))
		.returning()
		.execute()

	if (!appSettingsRes) {
		error(500, 'Failed to update app settings')
	}

	if (appSettingsData.adminsList) {
		const insertedUsers = await adminsToInsert(appSettingsData)
		return { appSettingsRes, insertedUsers }
	}

	return { appSettingsRes }
}

const insertUsers = async (usersToInsert: { id: string; role: UserRoles }[]): Promise<ReturnType<(typeof db)['insert']>[]> => {
	const results = await Promise.all(
		usersToInsert.map(async ({ id, role }) => {
			try {
				await db.transaction(async (trx) => {
					const insertedUser = await trx.insert(users).values({ id }).onConflictDoNothing({ target: users.id }).returning().execute()

					if (insertedUser) {
						await trx.insert(userMeta).values({ userId: id, metaName: USER_META.ROLE.value, valueText: role }).returning().execute()
					}

					return insertedUser
				})
			} catch (error) {
				console.error('Error inserting user:', { id, role }, error)
				return null
			}
		}),
	)

	return results.filter(Boolean) as unknown as ReturnType<(typeof db)['insert']>[]
}
