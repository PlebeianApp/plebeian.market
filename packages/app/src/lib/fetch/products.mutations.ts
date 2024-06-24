import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { KindProducts } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { ISO3, ProductImage } from '@plebeian/database'
import { createId } from '@plebeian/database/utils'

import { queryClient } from './client'

export const createProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, stall, images, shippingMethods]: [
			SubmitEvent,
			RichStall,
			Partial<ProductImage>[],
			{
				id: string
				name: string
				baseCost: string
				regions: ISO3[]
			}[],
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
				tags: [['d', identifier]],
			})

			await newEvent.sign(ndk.signer)
			const nostrEvent = await newEvent.toNostrEvent()
			const result = await fetch(new URL('/api/v1/products', window.location.origin), {
				method: 'POST',
				body: JSON.stringify(nostrEvent),
				headers: {
					'Content-Type': 'application/json',
				},
			}).then((response) => response.json())
			return result
		},
	},
	queryClient,
)

export const editProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, product, images, shippingMethods]: [
			SubmitEvent,
			DisplayProduct,
			Partial<ProductImage>[],
			{
				id: string
				name: string
				baseCost: string
				regions: ISO3[]
			}[],
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
				tags: [['d', identifier]],
			})

			await newEvent.sign(ndk.signer)
			const nostrEvent = await newEvent.toNostrEvent()
			const result = await fetch(new URL(`/api/v1/products/${product.id}`, window.location.origin), {
				method: 'PUT',
				body: JSON.stringify(nostrEvent),
				headers: {
					'Content-Type': 'application/json',
				},
			}).then((response) => response.json())
			return result
		},
	},
	queryClient,
)
