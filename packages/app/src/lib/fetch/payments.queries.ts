import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/payments/?userId=${string}`]: Operation<string, 'GET', never, never, RichPaymentDetail[], never>
	}
}

export const paymentsQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['paymentDetails', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`GET /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
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
