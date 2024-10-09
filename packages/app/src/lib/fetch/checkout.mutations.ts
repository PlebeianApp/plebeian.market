import type { NormalizedCart } from '$lib/stores/cart'
import { createMutation } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/checkout': Operation<string, 'POST', never, NormalizedCart, { success: boolean }, never>
	}
}

export const persistOrdersAndInvoicesMutation = createMutation(
	{
		mutationKey: ['persistOrdersAndInvoices'],
		mutationFn: async (cartData: NormalizedCart) => {
			return createRequest('POST /api/v1/checkout', {
				body: cartData,
				auth: true,
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] })
			queryClient.invalidateQueries({ queryKey: ['invoices'] })
		},
	},
	queryClient,
)
