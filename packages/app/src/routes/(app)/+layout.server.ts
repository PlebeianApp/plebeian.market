import { isInitialSetup } from '$lib/server/setup.service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const initialSetup = await isInitialSetup()
	return { initialSetup }
}

export const prerender = true
