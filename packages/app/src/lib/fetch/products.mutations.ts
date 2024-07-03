import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { KindProducts } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { getEventCoordinates } from '$lib/utils'
import { get } from 'svelte/store'

import type { ISO3, ProductImage } from '@plebeian/database'
import { createId } from '@plebeian/database/utils'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/products': Operation<string, 'POST', never, NostrEvent[], DisplayProduct[], never>
		[k: `PUT /api/v1/products/${string}`]: Operation<string, 'PUT', never, NostrEvent, DisplayProduct, never>
		[k: `DELETE /api/v1/products/${string}`]: Operation<string, 'DELETE', never, string, string, never>
	}
}

export type Category = { key: string; name: string; checked: boolean }

export const createProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, stall, images, shippingMethods, categories]: [
			SubmitEvent,
			RichStall,
			Partial<ProductImage>[],
			{
				id: string
				name: string
				cost: string
				regions: ISO3[]
			}[],
			Category[],
		]) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const identifier = createId()
			const evContent = {
				id: identifier,
				stall_id: stall.id,
				name: formData.get('title'),
				description: formData.get('description'),
				images: images,
				price: Number(formData.get('price')),
				quantity: Number(formData.get('quantity')),
				shipping: shippingMethods,
				currency: stall.currency,
			}
			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: Math.floor(Date.now()),
				tags: [['d', identifier], ...categories.map((c) => ['t', c.name])],
			})

			await newEvent.sign(ndk.signer)
			get(createProductsFromNostrMutation).mutateAsync(new Set([newEvent]))
		},
	},
	queryClient,
)

export const editProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, product, images, shippingMethods, categories]: [
			SubmitEvent,
			DisplayProduct,
			Partial<ProductImage>[],
			{
				id: string
				name: string
				cost: string
				regions: ISO3[]
			}[],
			Category[],
		]) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const identifier = product?.identifier ? product.identifier : createId()
			const evContent = {
				id: identifier,
				stall_id: product?.stallId,
				name: formData.get('title'),
				description: formData.get('description'),
				images: images,
				price: Number(formData.get('price')),
				quantity: Number(formData.get('quantity')),
				shipping: shippingMethods,
				currency: product?.currency,
			}
			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: Math.floor(Date.now()),
				tags: [['d', identifier], ...categories.map((c) => ['t', c.name]), ...(product?.stallId ? [['a', product.stallId]] : [])],
			})

			await newEvent.sign(ndk.signer)
			const nostrEvent = await newEvent.toNostrEvent()
			await createRequest(`PUT /api/v1/products/${product.id}`, {
				body: nostrEvent,
			})
		},
	},
	queryClient,
)

export const createProductsFromNostrMutation = createMutation(
	{
		mutationFn: async (products: Set<NDKEvent>) => {
			const nostrEventsToInsert = await Promise.all([...products].map((product) => product.toNostrEvent()))
			try {
				const response = createRequest(`POST /api/v1/products`, {
					body: nostrEventsToInsert,
				})
				if (!response) {
					return null
				}
				return response
			} catch (e) {
				console.log(e)
			}
		},
		onSuccess: (data: DisplayProduct[] | undefined | null) => {
			console.log('Products inserted in db successfully: ', data?.length)
			if (data) {
				queryClient.invalidateQueries({ queryKey: ['products', data[0].userId] })
				queryClient.invalidateQueries({ queryKey: ['shipping', data[0].stallId] })
			}
		},
	},
	queryClient,
)

export const deleteProductMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (productId: string) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const res = await createRequest(`DELETE /api/v1/products/${productId}`, {
					auth: true,
				})
				return res
			}
			return null
		},
		onSuccess: (productId: string | null) => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
			queryClient.invalidateQueries({ queryKey: ['categories', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
