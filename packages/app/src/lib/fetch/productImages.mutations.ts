import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

import { createRequest, queryClient } from './client'

export type RemoveProductImageArgs = {
	productId: string
	imageUrl: string
}

export type UpdateProductImageArgs = Partial<ProductImage> & {
	newImageUrl?: string
}

declare module './client' {
	interface Endpoints {
		[k: `DELETE /api/v1/product-images?productId=${string}&imageUrl=${string}`]: Operation<
			string,
			'DELETE',
			never,
			RemoveProductImageArgs,
			ProductImage,
			never
		>
		'POST /api/v1/product-images': Operation<string, 'POST', never, Partial<ProductImage>, ProductImage, never>
		'PUT /api/v1/product-images': Operation<string, 'PUT', never, UpdateProductImageArgs, ProductImage, never>
	}
}

export const editProductImageMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ productId, imageUrl, imageOrder, newImageUrl }: UpdateProductImageArgs) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/product-images`, {
					auth: true,
					body: { productId, imageUrl, imageOrder, newImageUrl },
				})
				return user
			}
			return null
		},
	},
	queryClient,
)
