import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { KindProducts, KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { shouldRegister, unixTimeNow } from '$lib/utils'
import { get } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'
import { createSlugId } from '@plebeian/database/utils'

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
				cost: string
			}[],
			Category[],
		]) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const productTile = String(formData.get('title'))
			const productDescription = String(formData.get('description'))
			const productPrice = Number(formData.get('price'))
			const productQty = Number(formData.get('quantity'))
			const identifier = createSlugId(productTile)
			const evContent = {
				id: identifier,
				stall_id: stall.id.split(':').length == 3 ? stall.id.split(':')[2] : stall.id,
				name: productTile,
				description: productDescription,
				images: images,
				price: productPrice,
				quantity: productQty,
				shipping: shippingMethods,
				currency: stall.currency,
			}
			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: unixTimeNow(),
				tags: [['d', identifier], ...categories.map((c) => ['t', c.name])],
			})

			await newEvent.sign()
			// await newEvent.publish().then((d) => console.log(d))
			const _shouldRegister = await shouldRegister(undefined, undefined, $ndkStore.activeUser.pubkey)
			if (_shouldRegister) get(createProductsFromNostrMutation).mutateAsync(new Set([newEvent]))
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
				cost: string
			}[],
			Category[],
		]) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const productTile = String(formData.get('title'))
			const productDescription = String(formData.get('description'))
			const productPrice = Number(formData.get('price'))
			const productQty = Number(formData.get('quantity'))
			const identifier = createSlugId(productTile)
			const stallCoordinates =
				product?.stallId.split(':').length == 3 ? product?.stallId : `${KindStalls}:${product.userId}:${product?.stallId}`
			const evContent = {
				id: identifier,
				stall_id: product?.stallId.split(':').length == 3 ? product?.stallId.split(':')[2] : product?.stallId,
				name: productTile,
				description: productDescription,
				images: images,
				price: productPrice,
				quantity: productQty,
				shipping: shippingMethods,
				currency: product?.currency,
			}
			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: unixTimeNow(),
				tags: [['d', identifier], ...categories.map((c) => ['t', c.name]), ...(product?.stallId ? [['a', stallCoordinates]] : [])],
			})

			await newEvent.sign()
			// await newEvent.publish().then((d) => console.log(d))
			const nostrEvent = await newEvent.toNostrEvent()
			const _shouldRegister = await shouldRegister(undefined, undefined, $ndkStore.activeUser.pubkey)
			if (_shouldRegister) {
				await createRequest(`PUT /api/v1/products/${product.id}`, {
					body: nostrEvent,
				})
			}
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
				queryClient.invalidateQueries({ queryKey: ['categories'] })
				queryClient.invalidateQueries({ queryKey: ['stalls'] })
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
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			queryClient.invalidateQueries({ queryKey: ['stalls'] })
		},
	},
	queryClient,
)
