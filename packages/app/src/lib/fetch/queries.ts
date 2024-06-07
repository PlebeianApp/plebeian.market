import type { RichCat } from '$lib/server/categories.service'
import type { DisplayProduct } from '$lib/server/products.service'
import { createQuery } from '@tanstack/svelte-query'
import { CatsFilter, catsFilterSchema, ProductsFilter, productsFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { currencyToBtc } from '$lib/utils'
import { derived } from 'svelte/store'

import type { User } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/users/${string}`]: Operation<string, 'GET', never, never, User, never>
		'GET /api/v1/category': Operation<'/api/v1/category', 'GET', never, never, RichCat[], CatsFilter>
		'GET /api/v1/products': Operation<'/api/v1/products', 'GET', never, never, DisplayProduct[], ProductsFilter>
	}
}

export const userQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['user', !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})

				return user
			}
			return null
		},
	})),
	queryClient,
)

export const createProductPriceQuery = (product: DisplayProduct) =>
	createQuery<number | null>(
		{
			queryKey: ['products', 'price', product.id],
			queryFn: async () => {
				return await currencyToBtc(product.currency, product.price, true)
			},
		},
		queryClient,
	)

export const categoriesQuery = createQuery<RichCat[]>(
	{
		queryKey: ['categories'],
	},
	queryClient,
)

export const createCategoryByFilterQuery = (filter: Partial<CatsFilter>) =>
	createQuery({
		queryKey: ['categories', Object.values(filter)],
		queryFn: async () => {
			const [category] = await createRequest('GET /api/v1/category', {
				params: catsFilterSchema.parse(filter),
			})
			return category
		},
	})

export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
	createQuery({
		queryKey: ['products', Object.values(filter)],
		queryFn: async () => {
			const products = await createRequest('GET /api/v1/products', {
				params: catsFilterSchema.parse(filter),
			})
			return products
			// const filter: ProductsFilter = productsFilterSchema.parse({ catId: $page.params.catId, pageSize: 15 })
			// const res = await GETAllProducts(filter)
			// return res.json()
		},
	})
