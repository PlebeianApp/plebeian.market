import { error } from '@sveltejs/kit'
import { nip19 } from 'nostr-tools'

import type { NewAppSettings, UserRoles } from '@plebeian/database'
import { appSettings, db, eq, users } from '@plebeian/database'

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const doSetup = async (setupData: NewAppSettings, adminList?: string[]) => {
	if (!setupData.instancePk) {
		error(400, 'Invalid request')
	}

	const decodedInstancePk = nip19.decode(setupData.instancePk).data
	const decodedOwnerPk = setupData.ownerPk ? nip19.decode(setupData.ownerPk).data : null

	const updatedAppSettings = await updateAppSettings({
		...setupData,
		isFirstTimeRunning: false,
		instancePk: decodedInstancePk,
		defaultCurrency: setupData.defaultCurrency,
		ownerPk: decodedOwnerPk,
	})

	const adminsToInsert = [
		...(setupData.instancePk ? [{ id: decodedInstancePk.toString(), role: 'admin' }] : []),
		...(setupData.ownerPk ? [{ id: decodedOwnerPk.toString(), role: 'admin' }] : []),
		...(adminList?.map((adminPk) => ({
			id: nip19.decode(adminPk).data.toString(),
			role: 'admin',
		})) ?? []),
	]

	const insertedUsers = await insertUsers(adminsToInsert)

	return { updatedAppSettings, insertedUsers }
}

const updateAppSettings = async (newAppSettings: NewAppSettings) => {
	const [appSettingsRes] = await db
		.update(appSettings)
		.set(newAppSettings)
		.where(eq(appSettings.isFirstTimeRunning, true))
		.returning()
		.execute()
	return appSettingsRes
}

const insertUsers = async (usersToInsert: { id: string; role: UserRoles }[]) => {
	const newUser = await db.insert(users).values(usersToInsert).returning().execute()
	return newUser
}
