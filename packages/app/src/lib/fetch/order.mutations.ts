import type { OrderFilter } from '$lib/schema'
import type { DisplayOrder } from '$lib/server/orders.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { Order, OrderStatus } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/orders': Operation<string, 'POST', never, OrderFilter, Order, never>
		[k: `PUT /api/v1/orders/${string}`]: Operation<string, 'PUT', never, Partial<OrderFilter>, Order, never>
	}
}

export const createOrderMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (orderFilter: OrderFilter) => {
			return createRequest(`POST /api/v1/orders`, {
				auth: true,
				body: orderFilter,
			})
		},
	},
	queryClient,
)

export const updateOrderMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ([orderId, orderFilter]: [string, Partial<OrderFilter>]) => {
			return createRequest(`PUT /api/v1/orders/${orderId}`, {
				auth: true,
				body: orderFilter,
			})
		},
	},
	queryClient,
)
export const updateOrderStatusMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const updatedOrder = await createRequest(`PUT /api/v1/orders/${orderId}/status`, {
					auth: true,
					body: { status },
				})
				return updatedOrder
			}
			return null
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] })
			queryClient.invalidateQueries({ queryKey: ['products'] })
		},
	},
	queryClient,
)
