import { currencyQueries } from '$lib/fetch/products.queries'
import { getAllForbiddenWords } from '$lib/server/appSettings.service'
import { getAppSettings } from '$lib/server/setup.service'
import { resolveQuery } from '$lib/utils'

import type { AppSettings, PaymentDetailsMethod } from '@plebeian/database'
import { CURRENCIES, PAYMENT_DETAILS_METHOD } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return {
		prices: await fetchInitialPrices(),
		appSettings: (await getAppSettings()) as AppSettings,
		forbiddenWords: await getAllForbiddenWords(),
		paymentDetailsMethod: Object.values(PAYMENT_DETAILS_METHOD) as unknown as PaymentDetailsMethod,
		isTest: process.env.MODE === 'test',
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

	const data = [
		...(await Promise.all(
			CURRENCIES.slice(2).map(async (c) => {
				try {
					const price = await resolveQuery(() => currencyQueries[c])
					return [c, price] as const
				} catch (error) {
					console.error(`Failed to fetch price for ${c}:`, error)
					return [c, null] as const
				}
			}),
		)),
		['SATS', 1e8],
		['BTC', 1],
	]

	cache.data = data
	cache.timestamp = now

	return data
}

export const prerender = false
