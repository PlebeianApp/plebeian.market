import type { OrdersFilter } from '$lib/schema'
import type { DisplayOrder } from '$lib/server/orders.service'
import { createQuery } from '@tanstack/svelte-query'
import { ordersFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/orders': Operation<'/api/v1/orders', 'GET', never, never, { total: number; orders: DisplayOrder[] }, Partial<OrdersFilter>>
		'GET /api/v1/orders/:userId': Operation<
			`/api/v1/orders/${string}`,
			'GET',
			never,
			never,
			{ total: number; orders: DisplayOrder[] },
			Partial<OrdersFilter>
		>
		[k: `GET /api/v1/orders/${string}`]: Operation<string, 'GET', never, never, DisplayOrder, never>
	}
}

export const createOrderQuery = (orderId: string) =>
	createQuery<DisplayOrder>(
		{
			queryKey: ['orders', orderId],
			queryFn: async () => {
				return await createRequest(`GET /api/v1/orders/${orderId}`, {
					auth: true,
				})
			},
		},
		queryClient,
	)

export const createOrdersByUserAndRoleQuery = (userId: string, role: 'buyer' | 'seller') =>
	createQuery<{ total: number; orders: DisplayOrder[] }>(
		{
			queryKey: ['orders', userId, role, 'list'],
			queryFn: async () => {
				return await createRequest('GET /api/v1/orders', {
					auth: true,
					params: {
						userId,
						role,
					},
				})
			},
			refetchOnWindowFocus: true,
		},
		queryClient,
	)

export const createOrdersQuery = (filter: Partial<OrdersFilter> = ordersFilterSchema.parse({})) =>
	createQuery<{ total: number; orders: DisplayOrder[] }>(
		{
			queryKey: ['orders', 'list', ...Object.values(filter)],
			queryFn: async () => {
				return await createRequest('GET /api/v1/orders', {
					auth: true,
					params: filter,
				})
			},
		},
		queryClient,
	)
