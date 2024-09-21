import type { CreateInvoiceFilter, UpdateInvoiceFilter } from '$lib/schema'
import { createMutation } from '@tanstack/svelte-query'

import type { Invoice } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/invoices': Operation<string, 'POST', never, CreateInvoiceFilter, Invoice, never>
		[k: `PUT /api/v1/invoices/${string}`]: Operation<string, 'PUT', never, Partial<UpdateInvoiceFilter>, Invoice, never>
	}
}

export const createInvoiceMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (invoicesFilter: CreateInvoiceFilter) => {
			return createRequest(`POST /api/v1/invoices`, {
				auth: true,
				body: invoicesFilter,
			})
		},
	},
	queryClient,
)

export const updateInvoiceMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ([invoiceId, invoicesFilter]: [string, Partial<UpdateInvoiceFilter>]) => {
			return createRequest(`PUT /api/v1/invoices/${invoiceId}`, {
				auth: true,
				body: invoicesFilter,
			})
		},
	},
	queryClient,
)
