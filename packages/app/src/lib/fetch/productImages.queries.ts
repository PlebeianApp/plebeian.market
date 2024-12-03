import type { ProductsFilter } from '$lib/schema'
import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

import { createRequest, queryClient } from './client'
import { productKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/product-images?userId=${string}`]: Operation<string, 'GET', never, never, ProductImage[], ProductsFilter>
	}
}

export const productImagesForUserQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: $ndkStore.activeUser?.pubkey ? productKeys.images.byUser($ndkStore.activeUser.pubkey) : [''],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				return createRequest(`GET /api/v1/product-images?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: false,
				})
			}
			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)
