import type { PaymentDetailsMethod } from '@plebeian/database'
import { PAYMENT_DETAILS_METHOD } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return { paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) as unknown as PaymentDetailsMethod }
}

export const prerender = true
