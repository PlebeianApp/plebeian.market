import { getAppSettings } from '$lib/server/setup.service'

import type { AppSettings, PaymentDetailsMethod } from '@plebeian/database'
import { PAYMENT_DETAILS_METHOD } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		appSettings: (await getAppSettings()) as AppSettings,
		paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) as unknown as PaymentDetailsMethod,
	}
}

export const prerender = false
