import { ofetch } from 'ofetch'

import { CURRENCIES } from '@plebeian/database'

const cache: {
	data: unknown
	timestamp: number
} = {
	data: null,
	timestamp: 0,
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const fetchInitialPrices = async () => {
	const now = Date.now()

	if (cache.data && now - cache.timestamp < CACHE_DURATION) {
		return cache.data
	}

	try {
		const { BTC } = await ofetch<{
			BTC: Record<string, number>
		}>(`https://api.yadio.io/exrates/BTC`)

		const data = [
			...(await Promise.all(
				CURRENCIES.slice(2).map(async (c) => {
					try {
						return [c, BTC[c]] as const
					} catch (error) {
						console.error(`Failed to fetch price for ${c}:`, error)
						return [c, null] as const
					}
				}),
			)),
			['SATS', 1e8] as const,
			['BTC', 1] as const,
		] as const

		cache.data = data
		cache.timestamp = now

		return data
	} catch (error) {
		console.error('Failed to fetch initial prices:', error)
		return (
			cache.data ?? [
				['SATS', 1e8],
				['BTC', 1],
			]
		)
	}
}
