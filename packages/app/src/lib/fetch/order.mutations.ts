import type { OrderFilter } from '$lib/schema'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { ordersStore } from '$lib/stores/orders'
import { get } from 'svelte/store'

import type { Order, OrderStatus } from '@plebeian/database'

import { createRequest, queryClient } from './client'
import { orderKeys, productKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/orders': Operation<string, 'POST', never, OrderFilter, Order, never>
		[k: `PUT /api/v1/orders/${string}`]: Operation<string, 'PUT', never, Partial<OrderFilter>, Order, never>
	}
}

export const createOrderMutation = createMutation(
	{
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
		mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				try {
					const updatedOrder = await createRequest(`PUT /api/v1/orders/${orderId}/status`, {
						auth: true,
						body: { status },
					})
					return updatedOrder
				} catch (error) {
					const memoryOrder = ordersStore.getOrder(orderId)
					if (memoryOrder) {
						ordersStore.updateStatus(orderId, status)
						return {
							...memoryOrder,
							status,
							updatedAt: new Date(),
						}
					}
					throw error
				}
			}
			return null
		},
		onSuccess: (data) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: orderKeys.all })
				queryClient.invalidateQueries({ queryKey: productKeys.detail(data.sellerUserId) })
			}
		},
	},
	queryClient,
)
