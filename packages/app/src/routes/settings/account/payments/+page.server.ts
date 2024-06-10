import { PAYMENT_DETAILS_METHOD } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return { paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) }
}

export const prerender = true
