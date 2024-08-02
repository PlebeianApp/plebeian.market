import type { DisplayOrder } from '$lib/server/orders.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { OrderStatus } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/orders/${string}/status`]: Operation<string, 'PUT', never, { status: OrderStatus }, DisplayOrder, never>
	}
}

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
		onSuccess: (updatedOrder: DisplayOrder | null) => {
			if (updatedOrder) {
				const $ndkStore = get(ndkStore)
				queryClient.invalidateQueries({ queryKey: ['orders', $ndkStore.activeUser?.pubkey] })
				queryClient.invalidateQueries({ queryKey: ['orders', $ndkStore.activeUser?.pubkey, 'buyer'] })
				queryClient.invalidateQueries({ queryKey: ['orders', $ndkStore.activeUser?.pubkey, 'seller'] })
			}
		},
	},
	queryClient,
)
