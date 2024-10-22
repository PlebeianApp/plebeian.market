import type { DisplayOrder } from '$lib/server/orders.service'
import { createOrdersByUserAndRoleQuery } from '$lib/fetch/order.queries'
import { unseenDMs } from '$lib/nostrSubs/subs'
import ndkStore from '$lib/stores/ndk'
import { resolveQuery } from '$lib/utils'
import { derived } from 'svelte/store'

import { ORDER_STATUS } from '@plebeian/database/constants'

export const purchasedOrderQuery = derived(ndkStore, ($ndkStore) =>
	createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'buyer'),
)

export const pendingPurchasedOrders = derived(
	[ndkStore, purchasedOrderQuery],
	([$ndkStore, $purchasedOrderQuery], set) => {
		if ($ndkStore.activeUser?.pubkey) {
			resolveQuery(() => $purchasedOrderQuery).then((data) =>
				set(data.orders.filter((order) => order.status === ORDER_STATUS.PENDING) || []),
			)
		}
	},
	[] as DisplayOrder[],
)

export const salesOrderQuery = derived(ndkStore, ($ndkStore) =>
	createOrdersByUserAndRoleQuery($ndkStore.activeUser?.pubkey ?? '', 'seller'),
)

export const pendingSalesOrders = derived(
	[ndkStore, salesOrderQuery],
	([$ndkStore, $salesOrderQuery], set) => {
		if ($ndkStore.activeUser?.pubkey) {
			resolveQuery(() => $salesOrderQuery).then((data) => set(data.orders.filter((order) => order.status === ORDER_STATUS.PENDING) || []))
		}
	},
	[] as DisplayOrder[],
)

export const hasActivity = derived(
	[unseenDMs, pendingPurchasedOrders, pendingSalesOrders],
	([$unseenDMs, $pendingPurchasedOrders, $pendingSalesOrders]) => {
		return !!(Object.keys($unseenDMs).length || $pendingPurchasedOrders.length || $pendingSalesOrders.length)
	},
)
