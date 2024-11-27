import { getAppSettings } from '$lib/server/setup.service'

import type { AppSettings } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({setHeaders}) => {
	// setHeaders({
	// 	'Cache-Control': 'no-store'
	// })
	const appSettings = (await getAppSettings()) as AppSettings
	return { appSettings }
}
