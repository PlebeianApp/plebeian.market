import { getAppSettings } from '$lib/server/appSettings.service'

export const load = async () => {
	return { appSettings: await getAppSettings() }
}
