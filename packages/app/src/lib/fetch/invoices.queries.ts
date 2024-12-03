import type { InvoicesFilter } from '$lib/schema'
import type { DisplayInvoice } from '$lib/server/invoices.service'
import { createQuery } from '@tanstack/svelte-query'
import { invoicesFilterSchema } from '$lib/schema'

import { createRequest, queryClient } from './client'
import { invoiceKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		'GET /api/v1/invoices': Operation<'/api/v1/invoices', 'GET', never, never, DisplayInvoice[], Partial<InvoicesFilter>>
		[k: `GET /api/v1/invoices/${string}`]: Operation<string, 'GET', never, never, DisplayInvoice[], never>
	}
}

export const createInvoiceQuery = (invoiceId: string) =>
	createQuery(
		{
			queryKey: invoiceKeys.detail(invoiceId),
			queryFn: async () => {
				return await createRequest(`GET /api/v1/invoices/${invoiceId}`, {
					auth: true,
				})
			},
		},
		queryClient,
	)

export const createInvoicesByFilterQuery = (filter: Partial<InvoicesFilter>) =>
	createQuery(
		{
			queryKey: invoiceKeys.filtered(filter),
			queryFn: async () => {
				return await createRequest('GET /api/v1/invoices', {
					params: invoicesFilterSchema.parse(filter),
				})
			},
		},
		queryClient,
	)
