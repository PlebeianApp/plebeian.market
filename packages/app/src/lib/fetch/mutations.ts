import type { KindProducts } from '$lib/constants'
import type { DisplayProduct } from '$lib/server/products.service'
import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { deleteAccount } from '$lib/stores/session'
import { get } from 'svelte/store'

import type { CURRENCIES, ISO3, User } from '@plebeian/database'
import { createId } from '@plebeian/database/utils'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/users/${string}`]: Operation<string, 'PUT', never, NDKUser['profile'], User, never>
		[k: `DELETE /api/v1/users/${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
	}
}

export const userDataMutation = createMutation(
	{
		mutationFn: async () => {
			const $ndkStore = get(ndkStore)
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})
			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: ndkUser.profile,
				})
				return user
			}
			return null
		},
		onSuccess: (data: User | null) => {
			const $ndkStore = get(ndkStore)

			queryClient.invalidateQueries({ queryKey: ['user', !!$ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', !!$ndkStore.activeUser?.pubkey], data)
		},
	},
	queryClient,
)

export const userDeleteAccountMutation = createMutation(
	{
		mutationFn: async () => {
			const $ndkStore = get(ndkStore)
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})

			if ($ndkStore.activeUser?.pubkey) {
				const deleted = await createRequest(`DELETE /api/v1/users/${ndkUser.pubkey}`, {
					auth: true,
				})
				return deleted
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			deleteAccount($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : '')
			delete $ndkStore.signer
			goto('/')
		},
	},
	queryClient,
)

export const createEditProductMutation = createMutation(
	{
		mutationFn: async ([sEvent, product, currency, images, shippingMethods]: [
			SubmitEvent,
			DisplayProduct | null,
			(typeof CURRENCIES)[number],
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
				stall_id: '30017:96c727f4d1ea18a80d03621520ebfe3c9be1387033009a4f5b65959d09222eec:ttrndvmz9q',
				name: formData.get('title'),
				description: formData.get('description'),
				// TODO: implement image uploading in a seperate api
				images: images,
				price: Number(formData.get('price')),
				quantity: Number(formData.get('quantity')),
				shipping: shippingMethods,
				currency,
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
