import type { NormalizedCart } from '$lib/stores/cart'
import { createMutation } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'
import { invoiceKeys, orderKeys, productKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/checkout': Operation<string, 'POST', never, NormalizedCart, { success: boolean }, never>
	}
}

export const persistOrdersAndInvoicesMutation = createMutation(
	{
		mutationKey: ['persistOrdersAndInvoices'],
		mutationFn: async (cartData: NormalizedCart) => {
			return await createRequest('POST /api/v1/checkout', {
				body: cartData,
				auth: true,
			})
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: orderKeys.all })
			queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
			for (const key in variables.users) {
				queryClient.invalidateQueries({ queryKey: productKeys.filtered({ userId: variables.users[key].pubkey }) })
			}
		},
	},
	queryClient,
)
