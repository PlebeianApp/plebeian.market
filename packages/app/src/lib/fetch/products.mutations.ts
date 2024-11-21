import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { z } from 'zod'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import { KindProducts, KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { parseCoordinatesString, shouldRegister, unixTimeNow } from '$lib/utils'
import { publishEvent } from '$lib/utils/nostr.utils'
import { toast } from 'svelte-sonner'
import { get } from 'svelte/store'

import { createProductEventSchema, forbiddenPatternStore } from '../../schema/nostr-events'
import { createRequest, queryClient } from './client'
import { createCategoriesByFilterKey, createProductByFilterKey, createProductKey, createShippingKey, createStallsByFilterKey } from './keys'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/products': Operation<string, 'POST', never, NostrEvent[], DisplayProduct[], never>
		[k: `PUT /api/v1/products/${string}`]: Operation<string, 'PUT', never, NostrEvent, DisplayProduct, never>
		[k: `DELETE /api/v1/products/${string}`]: Operation<string, 'DELETE', never, string, string, never>
		[k: `POST /api/v1/products/${string}/featured`]: Operation<string, 'POST', never, { featured: boolean }, { id: string }, never>
		[k: `POST /api/v1/products/${string}/ban`]: Operation<string, 'POST', never, { banned: boolean }, { id: string }, never>
	}
}
export type Category = { key: string; name: string; checked: boolean }
const productSchema = createProductEventSchema(new RegExp(''))
export const createProductMutation = createMutation(
	{
		mutationFn: async ({ product, categories }: { product: z.infer<typeof productSchema>; categories: string[] }) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			const stallCoordinates = parseCoordinatesString(`${KindStalls}:${$ndkStore.activeUser.pubkey}:${product.stall_id}`)
			const evContent = {
				...product,
				stall_id: stallCoordinates.tagD!,
			}

			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: unixTimeNow(),
				tags: [['d', product.id!], ...categories.map((c) => ['t', c]), ['a', stallCoordinates.coordinates!]],
			})

			const publishedEvent = await publishEvent(newEvent)
			const _shouldRegister = await shouldRegister(undefined, undefined, $ndkStore.activeUser.pubkey)
			if (_shouldRegister && publishedEvent) {
				const response = await get(createProductsFromNostrMutation).mutateAsync(new Set([newEvent]))
				if (response) toast.success(`Product created!`)
				return response
			}
			if (publishedEvent) toast.success(`Product created!`)
			else toast.error(`Failed to create product!`)
		},
		onSuccess: (data: DisplayProduct[] | undefined | null) => {
			if (data) {
				// TODO: we should iterate over all queries and remove those that start with products, this approach is not correct
				queryClient.invalidateQueries({ queryKey: createProductByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createShippingKey('') })
				queryClient.invalidateQueries({ queryKey: createCategoriesByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createProductByFilterKey({ userId: data[0]?.userId }) })
			}
		},
	},
	queryClient,
)

export const editProductMutation = createMutation(
	{
		mutationFn: async ({ product, categories }: { product: z.infer<typeof productSchema>; categories: string[] }) => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey || !product.id) return

			const stallCoordinates = parseCoordinatesString(`${KindStalls}:${$ndkStore.activeUser.pubkey}:${product.stall_id}`)
			const productCoordinates = parseCoordinatesString(product.id)

			const evContent = {
				...product,
				id: productCoordinates.tagD!,
				stall_id: parseCoordinatesString(product.stall_id!).tagD,
			}

			const newEvent = new NDKEvent($ndkStore, {
				kind: KindProducts,
				pubkey: $ndkStore.activeUser.pubkey,
				content: JSON.stringify(evContent),
				created_at: unixTimeNow(),
				tags: [
					['d', productCoordinates.tagD!],
					...categories.map((c) => ['t', c]),
					...(stallCoordinates.coordinates ? [['a', stallCoordinates.coordinates!]] : []),
				],
			})
			const publishedEvent = await publishEvent(newEvent)
			const nostrEvent = await newEvent.toNostrEvent()
			const _shouldRegister = await shouldRegister(undefined, undefined, $ndkStore.activeUser.pubkey)
			if (_shouldRegister && publishedEvent) {
				const response = await createRequest(`PUT /api/v1/products/${product.id}`, {
					body: nostrEvent,
					auth: true,
				})
				if (response) toast.success(`Product updated!`)
				return response
			}
			if (publishedEvent) toast.success(`Product updated!`)
			else toast.error(`Failed to update product!`)
		},
		onSuccess: (data: DisplayProduct | undefined) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: createProductByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createShippingKey(data.stall_id) })
				queryClient.invalidateQueries({ queryKey: createCategoriesByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ stallId: data.stall_id }) })
			}
		},
	},
	queryClient,
)

export const editProductFromEventMutation = createMutation(
	{
		mutationFn: async (productEvent: NDKEvent): Promise<DisplayProduct | undefined> => {
			const $ndkStore = get(ndkStore)
			const pubkey = $ndkStore.activeUser?.pubkey

			if (!pubkey) {
				throw new Error('User not authenticated')
			}

			const productEventSchema = get(forbiddenPatternStore).createProductEventSchema

			let parsedContent: unknown
			try {
				parsedContent = JSON.parse(productEvent.content)
			} catch (e) {
				throw new Error('Invalid product event content')
			}

			const validationResult = productEventSchema.safeParse(parsedContent)

			if (!validationResult.success) {
				throw new Error(`Product validation failed: ${validationResult.error.message}`)
			}

			const nostrEvent = await productEvent.toNostrEvent()
			const shouldRegisterResult = await shouldRegister(undefined, undefined, pubkey)

			if (!shouldRegisterResult) {
				return
			}

			return createRequest(`PUT /api/v1/products/${validationResult.data.id}`, {
				body: nostrEvent,
			})
		},
		onSuccess: (data?: DisplayProduct) => {
			if (!data) return

			queryClient.invalidateQueries({ queryKey: createShippingKey(data.stall_id) })
			queryClient.invalidateQueries({ queryKey: createCategoriesByFilterKey({}) })
			queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ stallId: data.stall_id }) })
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
				queryClient.invalidateQueries({ queryKey: createProductByFilterKey({ userId: data[0].userId }) })
				queryClient.invalidateQueries({ queryKey: createShippingKey(data[0].stall_id) })
				queryClient.invalidateQueries({ queryKey: createCategoriesByFilterKey({}) })
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ stallId: data[0].stall_id }) })
			}
		},
	},
	queryClient,
)

export const setProductFeaturedMutation = createMutation(
	{
		mutationFn: async ({ productId, featured }: { productId: string; featured: boolean }) => {
			const response = await createRequest(`POST /api/v1/products/${productId}/featured`, {
				body: { featured },
				auth: true,
			})
			return response
		},
		onSuccess: ({ id }: { id: string }) => {
			if (id) {
				queryClient.invalidateQueries({ queryKey: createProductKey(id) })
			}
		},
	},
	queryClient,
)

export const setProductBannedMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ productId, banned }: { productId: string; banned: boolean }) => {
			const response = await createRequest(`POST /api/v1/products/${productId}/ban`, {
				body: { banned },
				auth: true,
			})
			return response
		},
		onSuccess: ({ id }: { id: string }) => {
			if (id) {
				if (!id) return
				queryClient.invalidateQueries({ queryKey: createProductKey(id) })
				goto('/')
			}
		},
	},
	queryClient,
)

export const deleteProductMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (productId: string) => {
			const res = await createRequest(`DELETE /api/v1/products/${productId}`, {
				auth: true,
			})
			return res
		},
		onSuccess: (productId: string | null) => {
			if (!productId) return
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: createProductByFilterKey({}) })
			queryClient.invalidateQueries({ queryKey: createCategoriesByFilterKey({ userId: $ndkStore.activeUser?.pubkey }) })
			queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ userId: $ndkStore.activeUser?.pubkey }) })
			goto('/')
		},
	},
	queryClient,
)

export const signProductStockMutation = createMutation(
	{
		mutationFn: async ({ product, newQuantity }: { product: DisplayProduct; newQuantity: number }) => {
			const newEvent = createProductEvent(product, newQuantity)
			if (!newEvent) return

			await publishEvent(newEvent)

			return newEvent
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: createProductByFilterKey({}) })
		},
	},
	queryClient,
)

export function createProductEvent(product: DisplayProduct, newQuantity?: number): NDKEvent | undefined {
	const $ndkStore = get(ndkStore)
	if (!$ndkStore.activeUser?.pubkey || !product.id) return

	const stallCoordinates = parseCoordinatesString(`${KindProducts}:${$ndkStore.activeUser.pubkey}:${product.stall_id}`)
	const productCoordinates = parseCoordinatesString(product.id)

	const transformedShipping =
		product.shipping?.map((ship) => ({
			id: ship.shippingId,
			cost: ship.cost,
		})) || undefined

	const transformedImages = product.images?.filter((img) => img.imageUrl).map((img) => img.imageUrl!) || undefined

	const eventContent = {
		id: product.identifier,
		stall_id: stallCoordinates.tagD!,
		name: product.name,
		currency: product.currency ?? undefined,
		price: product.price,
		quantity: newQuantity ?? product.quantity,
		shipping: transformedShipping,
		description: product.description?.trim() || undefined,
		images: transformedImages,
	}

	const newEvent = new NDKEvent($ndkStore, {
		kind: KindProducts,
		pubkey: $ndkStore.activeUser.pubkey,
		content: JSON.stringify(eventContent),
		created_at: unixTimeNow(),
		tags: [
			['d', productCoordinates.tagD!],
			...(product.categories || []).map((c) => ['t', c]),
			...(stallCoordinates.coordinates ? [['a', stallCoordinates.coordinates!]] : []),
		],
	})
	return newEvent
}
