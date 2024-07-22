import type { ProductsFilter } from '$lib/schema'
import type { DisplayProduct } from '$lib/server/products.service'
import { createQuery } from '@tanstack/svelte-query'
import { productsFilterSchema } from '$lib/schema'
import { currencyToBtc } from '$lib/utils'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/products': Operation<'/api/v1/products', 'GET', never, never, DisplayProduct[], ProductsFilter>
		[k: `GET /api/v1/products/${string}`]: Operation<string, 'GET', never, never, DisplayProduct, never>
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

export const createProductPriceQuery = (product: DisplayProduct) =>
	createQuery<number | null>(
		{
			queryKey: ['products', 'price', product.id],
			queryFn: async () => {
				// TODO get currency from stall
				return await currencyToBtc(String(product.currency), product.price, true)
			},
		},
		queryClient,
	)

export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
	createQuery<DisplayProduct[]>(
		{
			queryKey: ['products', ...Object.values(filter)],
			queryFn: async () => {
				const products = await createRequest('GET /api/v1/products', {
					params: productsFilterSchema.parse(filter),
				})
				return products
			},
		},
		queryClient,
	)
