import { getAppSettings } from '$lib/server/setup.service'
import { btcToCurrency } from '$lib/utils'

import { AppSettings, CURRENCIES, PAYMENT_DETAILS_METHOD, PaymentDetailsMethod } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		prices: await fetchInitialPrices(),
		appSettings: (await getAppSettings()) as AppSettings,
		paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) as unknown as PaymentDetailsMethod,
	}
}

const cache: {
	data: unknown
	timestamp: number
} = {
	data: null,
	timestamp: 0,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const fetchInitialPrices = async () => {
	const now = Date.now()

	// Check if the cache is still valid
	if (cache.data && now - cache.timestamp < CACHE_DURATION) {
		return cache.data
	}

	// Fetch new data and update the cache
	const data = [
		...(await Promise.all(CURRENCIES.slice(2).map(async (c) => [c, await btcToCurrency(c)] as const))),
		['SATS', 1e8],
		['BTC', 1],
	]

	cache.data = data
	cache.timestamp = now

	return data
}

export const prerender = false
