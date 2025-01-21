import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { ExistsResult } from '$lib/interfaces'
import type { ProductsFilter } from '$lib/schema'
import type { DisplayProduct } from '$lib/server/products.service'
import { createQuery } from '@tanstack/svelte-query'
import { browser } from '$app/environment'
import { numSatsInBtc } from '$lib/constants'
import { aggregatorAddProducts } from '$lib/nostrSubs/data-aggregator'
import { fetchUserProductData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
import { productsFilterSchema } from '$lib/schema'
import { parseCoordinatesString, resolveQuery } from '$lib/utils'
import { ofetch } from 'ofetch'

import { CURRENCIES } from '@plebeian/database/constants'

import { createRequest, queryClient } from './client'
import { productKeys } from './query-key-factory'

export interface ProductQueryData {
	total: number
	products: DisplayProduct[]
}

declare module './client' {
	interface Endpoints {
		'GET /api/v1/products': Operation<'/api/v1/products', 'GET', never, never, ProductQueryData, ProductsFilter>
		[k: `GET /api/v1/products/${string}`]: Operation<string, 'GET', never, never, DisplayProduct, never>
		[k: `GET /api/v1/products/${string}?exists`]: Operation<string, 'GET', never, never, ExistsResult, never>
	}
}

export const createProductQuery = (productId: string) =>
	createQuery<DisplayProduct | null>(
		{
			queryKey: productKeys.detail(productId),
			queryFn: async () => {
				try {
					const response = await createRequest(`GET /api/v1/products/${productId}`, {
						auth: false,
					})
					if (response) return response
					throw new Error(`failed fetching product: ${productId}`)
				} catch {
					const coordinates = parseCoordinatesString(productId)
					const { products: productsData } = await fetchUserProductData(coordinates.pubkey ?? '', coordinates.tagD)
					if (productsData?.size) {
						const result = await normalizeProductsFromNostr(productsData, coordinates.pubkey ?? '')
						if (result) {
							const { toDisplayProducts, stallProducts } = result
							aggregatorAddProducts(stallProducts)

							return toDisplayProducts[0] as DisplayProduct
						}
					}
				}
				return null
			},
		},
		queryClient,
	)

const CURRENCY_CACHE_CONFIG = {
	STALE_TIME: 1000 * 60 * 5,
	RETRY_DELAY: 1000,
	RETRY_COUNT: 2,
	RESOLVE_TIMEOUT: 5000,
} as const

type Currency = (typeof CURRENCIES)[number]
type CurrencyQuery = Record<Currency, CreateQueryResult<number>>

const btcExchangeRateQuery = createQuery(
	{
		queryKey: productKeys.currency.base('BTC-original'),
		queryFn: async () => {
			console.log('Fetching BTC exchange rate')
			const { BTC } = await ofetch<{
				BTC: Record<Currency, number>
			}>(`https://api.yadio.io/exrates/BTC`)
			return BTC
		},
		staleTime: CURRENCY_CACHE_CONFIG.STALE_TIME,
	},
	queryClient,
)

export const currencyQueries: CurrencyQuery = {} as CurrencyQuery

for (const c of CURRENCIES) {
	currencyQueries[c] = createQuery(
		{
			queryKey: productKeys.currency.base(c),
			staleTime: CURRENCY_CACHE_CONFIG.STALE_TIME,
			queryFn: async () => {
				const prices = await resolveQuery(() => btcExchangeRateQuery, CURRENCY_CACHE_CONFIG.RESOLVE_TIMEOUT)
				if (!prices) throw new Error('failed fetching BTC exchange rate')
				return prices[c]
			},
			retryDelay: CURRENCY_CACHE_CONFIG.RETRY_DELAY,
		},
		queryClient,
	)
}

export const createCurrencyConversionQuery = (fromCurrency: string, amount: number) =>
	createQuery<number | null>(
		{
			queryKey: productKeys.currency.amount(fromCurrency, amount),
			queryFn: async () => {
				if (!fromCurrency || !amount || amount <= 0.0001) return null
				if (['sats', 'sat'].includes(fromCurrency.toLowerCase())) {
					return amount
				}

				try {
					const price = await resolveQuery(() => currencyQueries[fromCurrency as Currency], CURRENCY_CACHE_CONFIG.RESOLVE_TIMEOUT)
					return price ? (amount / price) * numSatsInBtc : null
				} catch (error) {
					console.error(`Currency conversion failed for ${fromCurrency}:`, error)
					throw error
				}
			},
			enabled: Boolean(fromCurrency && amount > 0),
			staleTime: CURRENCY_CACHE_CONFIG.STALE_TIME,
			retry: CURRENCY_CACHE_CONFIG.RETRY_COUNT,
		},
		queryClient,
	)
export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
	createQuery<ProductQueryData | null>(
		{
			queryKey: productKeys.filtered(filter),
			queryFn: async () => {
				try {
					const response = await createRequest('GET /api/v1/products', {
						params: productsFilterSchema.parse(filter),
					})
					if (response.products.length) return response
					throw Error
				} catch (error) {
					const userId = (filter.stallId && filter.stallId.split(':')[1]) || filter?.userId || null
					if (!userId) return null
					const { products: productsData } = await fetchUserProductData(userId)
					if (filter.stallId) {
						if (productsData?.size) {
							const parsedStallIdString = parseCoordinatesString(filter.stallId)
							const result = await normalizeProductsFromNostr(productsData, userId, parsedStallIdString.tagD)
							if (result) {
								const { toDisplayProducts, stallProducts } = result
								aggregatorAddProducts(stallProducts)

								return {
									total: toDisplayProducts.length,
									products: toDisplayProducts as DisplayProduct[],
								}
							}
						}
					} else if (filter.userId) {
						if (productsData?.size) {
							aggregatorAddProducts(productsData)
							const result = await normalizeProductsFromNostr(productsData, filter.userId)
							if (result) {
								const { toDisplayProducts } = result
								return {
									total: toDisplayProducts.length,
									products: toDisplayProducts as DisplayProduct[],
								}
							}
						}
					}
				}

				return null
			},
			enabled: !!browser,
		},
		queryClient,
	)

export const createProductExistsQuery = (id: string) =>
	createQuery<ExistsResult>(
		{
			queryKey: productKeys.exists(id),
			queryFn: async () => {
				const stallExists = await createRequest(`GET /api/v1/products/${id}?exists`, {})
				return stallExists
			},
			staleTime: Infinity,
		},
		queryClient,
	)
