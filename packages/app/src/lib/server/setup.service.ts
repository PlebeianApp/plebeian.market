import { error } from '@sveltejs/kit'
import { nip19 } from 'nostr-tools'

import type { NewAppSettings } from '@plebeian/database'
import { appSettings, db, eq, users } from '@plebeian/database'

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()
	return appSettingsRes.isFirstTimeRunning
}

export const doSetup = async (setupData: NewAppSettings) => {
	if (!setupData.instancePk || !setupData.ownerPk) {
		error(400, 'Invalid request')
	}

	const newAppSettings = {
		...setupData,
		isFirstTimeRunning: false,
		instancePk: nip19.decode(setupData.instancePk).data,
		ownerPk: nip19.decode(setupData.ownerPk).data,
		defaultCurrency: setupData.defaultCurrency,
	} as NewAppSettings

	const [appSettingsRes] = await db
		.update(appSettings)
		.set(newAppSettings)
		.where(eq(appSettings.isFirstTimeRunning, true))
		.returning()
		.execute()

	const userPubKeyHex = nip19.decode(setupData.ownerPk).data
	const [newUser] = await db
		.insert(users)
		.values({
			id: userPubKeyHex.toString(),
			role: 'admin',
		})
		.returning()
		.execute()

	return { appSettingsRes, newUser }
}
