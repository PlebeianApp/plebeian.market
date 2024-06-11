import { getAppSettings } from '$lib/server/setup.service'

import { CURRENCIES } from '@plebeian/database/constants'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const currencies = CURRENCIES

	const appSettings = await getAppSettings()
	return { currencies, initialSetup: appSettings.isFirstTimeRunning }
}
