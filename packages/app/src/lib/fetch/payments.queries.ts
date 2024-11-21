import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'
import { createPaymentsForStall, createPaymentsForUserKey, createPrivatePaymentsKey } from './keys'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/payments/?userId=${string}`]: Operation<string, 'GET', never, never, RichPaymentDetail[], never>
		[k: `GET /api/v1/payments/?userId=${string}&private`]: Operation<string, 'GET', never, never, RichPaymentDetail[], never>
		[k: `GET /api/v1/payments/${string}`]: Operation<string, 'GET', never, never, RichPaymentDetail[], never>
	}
}

export const privatePaymentsQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: $ndkStore.activeUser?.pubkey ? createPrivatePaymentsKey($ndkStore.activeUser?.pubkey) : [''],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}&private`, {
					auth: true,
				})

				return user
			}
			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)

export const createPaymentsForUserQuery = (userId: string) =>
	createQuery<RichPaymentDetail[]>(
		{
			queryKey: createPaymentsForUserKey(userId),
			queryFn: async () => {
				const paymentDetails = await createRequest(`GET /api/v1/payments/?userId=${userId}`, {
					auth: false,
				})
				return paymentDetails
			},
		},
		queryClient,
	)

export const paymentsForStallQuery = (stallId: string) =>
	createQuery<RichPaymentDetail[]>(
		{
			queryKey: createPaymentsForStall(stallId),
			queryFn: async () => {
				const paymentDetails = await createRequest(`GET /api/v1/payments/${stallId}`, {
					auth: true,
				})
				return paymentDetails
			},
		},
		queryClient,
	)
