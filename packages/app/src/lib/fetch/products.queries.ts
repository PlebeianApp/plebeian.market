import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ProductsFilter } from '$lib/schema'
import type { DisplayProduct } from '$lib/server/products.service'
import { createQuery } from '@tanstack/svelte-query'
import { fetchUserProductData, handleProductNostrData, normalizeProductsFromNostr } from '$lib/nostrSubs/utils'
import { productsFilterSchema } from '$lib/schema'
import { currencyToBtc, resolveQuery, shouldRegister } from '$lib/utils'

import { createRequest, queryClient } from './client'
import { createStallExistsQuery } from './stalls.queries'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/products': Operation<
			'/api/v1/products',
			'GET',
			never,
			never,
			{ total: number; products: Partial<DisplayProduct>[] },
			ProductsFilter
		>
		[k: `GET /api/v1/products/${string}`]: Operation<string, 'GET', never, never, DisplayProduct, never>
		[k: `GET /api/v1/products/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
	}
}

export const createProductQuery = (productId: string) =>
	createQuery<DisplayProduct>(
		{
			queryKey: ['products', productId],
			queryFn: async () => {
				return await createRequest(`GET /api/v1/products/${productId}`, {
					auth: false,
				})
			},
		},
		queryClient,
	)

export const createCurrencyConversionQuery = (fromCurrency: string, amount: number) =>
	createQuery<number | null>(
		{
			queryKey: ['currency-conversion', fromCurrency, amount],
			queryFn: async () => {
				if (!fromCurrency || !amount) return null
				const result = await currencyToBtc(fromCurrency, amount, true)
				return result
			},
			enabled: amount > 0,
			staleTime: 1000 * 60 * 60,
		},
		queryClient,
	)

// export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
// 	createQuery(
// 		{
// 			queryKey: ['products', ...Object.values(filter)],
// 			queryFn: async () => {
// 				const response = await createRequest('GET /api/v1/products', {
// 					params: productsFilterSchema.parse(filter),
// 				})
// 				if (response.products.length) return response
// 				if (filter.stallId) {
// 					const userId = filter.stallId.split(':')[1]
// 					const { products: productsData } = await fetchUserProductData(userId)
// 					if (productsData?.size) {
// 						const result = await normalizeProductsFromNostr(productsData, userId, filter.stallId)
// 						if (result?.toDisplayProducts.length) {
// 							const { toDisplayProducts: _toDisplay } = result
// 							return { total: _toDisplay.length, products: _toDisplay }
// 						}
// 					}
// 				}
// 			},
// 		},
// 		queryClient,
// 	)

export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
	createQuery<{ total: number; products: Partial<DisplayProduct>[]; origin: 'db' | 'nostr'; events?: Set<NDKEvent> } | null>(
		{
			queryKey: ['products', ...Object.values(filter)],
			queryFn: async () => {
				try {
					const response = await createRequest('GET /api/v1/products', {
						params: productsFilterSchema.parse(filter),
					})
					if (response.products.length) return { ...response, origin: 'db' }
					throw Error
				} catch (error) {
					const userId = (filter.stallId && filter.stallId.split(':')[1]) || filter?.userId || null
					if (!userId) return null
					const { products: productsData } = await fetchUserProductData(userId)

					if (filter.stallId) {
						if (productsData?.size) {
							const result = await normalizeProductsFromNostr(productsData, userId, filter.stallId)
							if (result) {
								const { stallProductsToDisplay } = result
								return {
									total: stallProductsToDisplay.length,
									products: stallProductsToDisplay as DisplayProduct[],
									origin: 'nostr',
									events: productsData,
								}
							}
						}
					} else if (filter.userId) {
						if (productsData?.size) {
							const result = await normalizeProductsFromNostr(productsData, filter.userId)
							if (result) {
								const { toDisplayProducts } = result
								return {
									total: toDisplayProducts.length,
									products: toDisplayProducts as DisplayProduct[],
									origin: 'nostr',
									events: productsData,
								}
							}
						}
					}
				}

				return null
			},
		},
		queryClient,
	)

export const createProductExistsQuery = (id: string) =>
	createQuery<boolean>(
		{
			queryKey: ['products', 'exists', id],
			queryFn: async () => {
				const stallExists = await createRequest(`GET /api/v1/products/${id}?exists`, {})
				return stallExists
			},
			staleTime: Infinity,
		},
		queryClient,
	)
