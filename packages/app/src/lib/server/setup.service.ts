import type { NewAppSettings } from '@plebeian/database'
import { appSettings, db } from '@plebeian/database'

export const isInitialSetup = async (): Promise<boolean> => {
	const [appSettingsRes] = await db.select().from(appSettings).execute()

	return appSettingsRes.isFirstTimeRunning
}

export const doSetup = async (setupData: NewAppSettings) => {
	const newAppSettings = {
		isFirstTimeRunning: false,
		...setupData,
	}

	const [appSettingsRes] = await db.insert(appSettings).values(newAppSettings).returning().execute()

	return appSettingsRes
}
