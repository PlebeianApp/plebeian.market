import { getAppSettings } from '$lib/server/appSettings.service'

import type { AppSettings } from '@plebeian/database'

export const load = async () => {
	return { appSettings: (await getAppSettings()) as AppSettings }
}
