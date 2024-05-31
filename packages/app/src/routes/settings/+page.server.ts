import { USER_TRUST_LEVEL } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return { userTrustLevels: Object.values(USER_TRUST_LEVEL) }
}

export const prerender = true
