import { getAppSettings } from '$lib/server/setup.service'

import type { AppSettings } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return { appSettings: (await getAppSettings()) as AppSettings }
}

export const prerender = false
