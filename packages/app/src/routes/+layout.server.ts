import { getAllForbiddenWords } from '$lib/server/appSettings.service'
import { fetchInitialPrices } from '$lib/server/currency.service'
import { getAppSettings } from '$lib/server/setup.service'

import type { PaymentDetailsMethod } from '@plebeian/database'
import { PAYMENT_DETAILS_METHOD } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		prices: await fetchInitialPrices(),
		appSettings: await getAppSettings(),
		forbiddenWords: await getAllForbiddenWords(),
		paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) as unknown as PaymentDetailsMethod,
		isTest: process.env.MODE === 'test',
	}
}

export const prerender = false
