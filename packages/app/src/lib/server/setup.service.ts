import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { decode } from 'nostr-tools/nip19'

import type { NewAppSettings, UserRoles } from '@plebeian/database'
import { appSettings, db, eq, USER_META, USER_ROLES, userMeta, users } from '@plebeian/database'

import { getUsersByRole } from './users.service'

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const getAppSettings = async () => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes
}

export const doSetup = async (setupData: NewAppSettings, adminList?: string[]) => {
	if (!setupData.instancePk) {
		error(400, 'Invalid request')
	}

	const decodedInstancePk = decode(setupData.instancePk).data.toString()
	const decodedOwnerPk = setupData.ownerPk ? decode(setupData.ownerPk).data.toString() : null

	const updatedAppSettings = await updateAppSettings({
		...setupData,
		isFirstTimeRunning: true,
		instancePk: decodedInstancePk,
		defaultCurrency: setupData.defaultCurrency,
		ownerPk: decodedOwnerPk,
		allowRegister: JSON.parse(setupData.allowRegister as unknown as string),
	})

	const insertedUsers = adminsToInsert(setupData, adminList)

	return { updatedAppSettings, insertedUsers }
}

const adminsToInsert = async (appSettingsData: NewAppSettings, adminList?: string[]) => {
	const instancePk = decode(appSettingsData.instancePk).data.toString()
	const ownerPk = appSettingsData.ownerPk ? decode(appSettingsData.ownerPk).data.toString() : null

	const adminsToInsert = [
		...(instancePk ? [{ id: instancePk, role: USER_ROLES.ADMIN }] : []),
		...(ownerPk ? [{ id: ownerPk, role: USER_ROLES.ADMIN }] : []),
		...(adminList?.map((adminPk) => ({
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

export const updateAppSettings = async (appSettingsData: NewAppSettings, adminList?: string[]) => {
	appSettingsData.instancePk = appSettingsData.instancePk.startsWith('npub')
		? decode(appSettingsData.instancePk).data.toString()
		: appSettingsData.instancePk

	appSettingsData.ownerPk = appSettingsData.ownerPk?.startsWith('npub')
		? decode(appSettingsData.ownerPk).data.toString()
		: appSettingsData.ownerPk

	appSettingsData.allowRegister = JSON.parse(appSettingsData.allowRegister as unknown as string)

	const [appSettingsRes] = await db
		.update(appSettings)
		.set({
			...appSettingsData,
			isFirstTimeRunning: false,
		})
		.where(appSettingsData.isFirstTimeRunning ? eq(appSettings.isFirstTimeRunning, true) : eq(appSettings.instancePk, instancePk))
		.returning()
		.execute()

	if (!appSettingsRes) {
		error(500, 'Failed to update app settings')
	}

	if (adminList) {
		const insertedUsers = await adminsToInsert(appSettingsData, adminList)
		return { appSettingsRes, insertedUsers }
	}

	return { appSettingsRes }
}

const insertUsers = async (usersToInsert: { id: string; role: UserRoles }[]) => {
	const insertedUsers = await Promise.all(
		usersToInsert.map(async (user) => {
			try {
				const insertedUser = await db.insert(users).values({ id: user.id }).onConflictDoNothing({ target: users.id }).returning().execute()
				await db.insert(userMeta).values({ userId: user.id, metaName: USER_META.ROLE.value, valueText: user.role }).returning().execute()
				return insertedUser
			} catch (error) {
				console.error(error)
				return null
			}
		}),
	)
	return insertedUsers.filter((user) => user !== null)
}
