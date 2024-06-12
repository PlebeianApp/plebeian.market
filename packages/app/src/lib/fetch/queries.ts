import type { CatsFilter, ProductsFilter, StallsFilter } from '$lib/schema'
import type { RichCat } from '$lib/server/categories.service'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import type { RichUser } from '$lib/server/users.service'
import { createQuery } from '@tanstack/svelte-query'
import { catsFilterSchema, productsFilterSchema, stallsFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { currencyToBtc } from '$lib/utils'
import { derived } from 'svelte/store'

import type { PaymentDetail, User } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/users/${string}`]: Operation<string, 'GET', never, never, RichUser | User, never>
		[k: `GET /api/v1/users/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
		'GET /api/v1/category': Operation<'/api/v1/category', 'GET', never, never, RichCat[], CatsFilter>
		'GET /api/v1/products': Operation<'/api/v1/products', 'GET', never, never, DisplayProduct[], ProductsFilter>
		'GET /api/v1/stalls': Operation<'/api/v1/stalls', 'GET', never, never, RichStall[], StallsFilter>
		[k: `GET /api/v1/payments/?userId=${string}`]: Operation<string, 'GET', never, never, PaymentDetail[], never>
	}
}

export const paymentsQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['paymentDetails', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})

				return user
			}
			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)

export const activeUserQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['users', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = (await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})) as RichUser
				return user
			}

			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
		staleTime: 0,
	})),
	queryClient,
)

export const createUserByIdQuery = (id: string) =>
	createQuery<User>(
		{
			queryKey: ['users', id],
			queryFn: async () => {
				const user = (await createRequest(`GET /api/v1/users/${id}`, {})) as User
				return user
			},
			enabled: !!id,
		},
		queryClient,
	)

export const createUserExistsQuery = (id: string) =>
	createQuery<boolean>(
		{
			queryKey: ['users', id],
			queryFn: async () => {
				const user = await createRequest(`GET /api/v1/users/${id}?exists`, {})
				return user
			},
		},
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

export const createCategoriesByFilterQuery = (filter: Partial<CatsFilter>) =>
	createQuery(
		{
			queryKey: ['categories', Object.values(filter)],
			queryFn: async () => {
				const categories = await createRequest('GET /api/v1/category', {
					params: catsFilterSchema.parse(filter),
				})
				return categories
			},
		},
		queryClient,
	)

export const createProductsByFilterQuery = (filter: Partial<ProductsFilter>) =>
	createQuery(
		{
			queryKey: ['products', Object.values(filter)],
			queryFn: async () => {
				const products = await createRequest('GET /api/v1/products', {
					params: productsFilterSchema.parse(filter),
				})
				return products
			},
		},
		queryClient,
	)

export const createStallsByFilterQuery = (filter: Partial<StallsFilter>) =>
	createQuery(
		{
			queryKey: ['stalls', Object.values(filter)],
			queryFn: async () => {
				const stalls = await createRequest('GET /api/v1/stalls', {
					params: stallsFilterSchema.parse(filter),
				})
				return stalls
			},
		},
		queryClient,
	)
