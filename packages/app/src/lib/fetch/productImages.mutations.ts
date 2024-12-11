import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

import { createRequest, queryClient } from './client'
import { productKeys } from './query-key-factory'

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
		mutationFn: async ({ productId, imageUrl, imageOrder, newImageUrl }: UpdateProductImageArgs) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return null

			return createRequest(`PUT /api/v1/product-images`, {
				auth: true,
				body: { productId, imageUrl, imageOrder, newImageUrl },
			})
		},
		onSuccess: (data: ProductImage | null) => {
			const $ndkStore = get(ndkStore)
			if (!data || !$ndkStore.activeUser?.pubkey) return

			queryClient.setQueryData(productKeys.images.byUser($ndkStore.activeUser.pubkey), (prevImages?: ProductImage[]) => {
				if (!prevImages) return [data]

				return prevImages.map((img) =>
					img.productId === data.productId && img.imageUrl === data.imageUrl
						? {
								...img,
								url: data.imageUrl,
								order: data.imageOrder,
							}
						: img,
				)
			})
		},
	},
	queryClient,
)
