import type { DisplayInvoice } from '$lib/server/invoices.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { Invoice, InvoiceStatus } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/invoices': Operation<string, 'POST', never, Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>, DisplayInvoice, never>
		[k: `PUT /api/v1/invoices/${string}`]: Operation<
			string,
			'PUT',
			never,
			{ status?: InvoiceStatus; observations?: string; preimage?: string },
			DisplayInvoice,
			never
		>
	}
}

export const createInvoiceMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest('POST /api/v1/invoices', {
					auth: true,
					body: invoiceData,
				})
			}
			return null
		},
		onSuccess: (data: DisplayInvoice | null) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ['invoices'] })
				queryClient.invalidateQueries({ queryKey: ['orders'] })
			}
		},
	},
	queryClient,
)

export const updateInvoiceStatusMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({
			invoiceId,
			status,
			observations,
			preimage,
		}: {
			invoiceId: string
			status?: InvoiceStatus
			observations?: string
			preimage?: string
		}) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				return await createRequest(`PUT /api/v1/invoices/${invoiceId}`, {
					auth: true,
					body: { status, preimage, observations },
				})
			}
			return null
		},
		onSuccess: (data: DisplayInvoice | null) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ['invoices', data.id] })
				queryClient.invalidateQueries({ queryKey: ['invoices', data.orderId] })
			}
		},
	},
	queryClient,
)
