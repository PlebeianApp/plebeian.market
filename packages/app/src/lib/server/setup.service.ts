import { error } from '@sveltejs/kit'
import { nip19 } from 'nostr-tools'

import type { NewAppSettings, UserRoles } from '@plebeian/database'
import { appSettings, db, eq, USER_META, userMeta, users } from '@plebeian/database'

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

	const decodedInstancePk = nip19.decode(setupData.instancePk).data.toString()
	const decodedOwnerPk = setupData.ownerPk ? nip19.decode(setupData.ownerPk).data.toString() : null

	const updatedAppSettings = await updateAppSettings({
		...setupData,
		isFirstTimeRunning: false,
		instancePk: decodedInstancePk,
		defaultCurrency: setupData.defaultCurrency,
		ownerPk: decodedOwnerPk,
		allowRegister: JSON.parse(setupData.allowRegister as unknown as string),
	})

	const adminsToInsert = [
		...(setupData.instancePk ? [{ id: decodedInstancePk.toString(), role: 'admin' }] : []),
		...(setupData.ownerPk ? [{ id: decodedOwnerPk, role: 'admin' }] : []),
		...(adminList?.map((adminPk) => ({
			id: nip19.decode(adminPk).data.toString(),
			role: 'admin',
		})) ?? []),
	].filter((admin) => admin.id !== null)

	const insertedUsers = await insertUsers(adminsToInsert as { id: string; role: UserRoles }[])

	return { updatedAppSettings, insertedUsers }
}

export const updateAppSettings = async (newAppSettings: NewAppSettings) => {
	const [appSettingsRes] = await db
		.update(appSettings)
		.set(newAppSettings)
		.where(eq(appSettings.isFirstTimeRunning, true))
		.returning()
		.execute()
	return appSettingsRes
}

const insertUsers = async (usersToInsert: { id: string; role: UserRoles }[]) => {
	const insertedUsers = await Promise.all(
		usersToInsert.map(async (user) => {
			const insertedUser = await db.insert(users).values({ id: user.id }).returning().execute()
			await db.insert(userMeta).values({ userId: user.id, metaName: USER_META.ROLE.value, valueText: user.role }).returning().execute()
			return insertedUser
		}),
	)
	return insertedUsers
}
