import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { KindProducts } from '$lib/constants'
import type { DisplayProduct } from '$lib/server/products.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { ISO3 } from '@plebeian/database'
import { createId } from '@plebeian/database/utils'

import { queryClient } from './client'

export const createEditProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, product, images, shippingMethods]: [
			SubmitEvent,
			DisplayProduct | null,
			string[],
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
				// TODO: implement image uploading in a seperate api
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
			const result = await fetch(new URL(product ? `/api/v1/products/${product.id}` : '/api/v1/products', window.location.origin), {
				// TODO: POST & PUT?
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
