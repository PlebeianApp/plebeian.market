import type { NDKEvent, NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import type { DisplayProduct } from '$lib/server/products.service'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import { KindProducts } from '$lib/constants'
import ndkStore, { ndk } from '$lib/stores/ndk'
import { deleteAccount } from '$lib/stores/session'
import { get } from 'svelte/store'

import type { ISO3, User } from '@plebeian/database'
import { createId } from '@plebeian/database/utils'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/users/${string}`]: Operation<string, 'PUT', never, NDKUser['profile'], User, never>
		[k: `DELETE /api/v1/users/${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
		[k: `POST /api/v1/payments/?userId=${string}`]: Operation<
			string,
			'POST',
			never,
			{
				paymentDetails: string
				paymentMethod: string
				stallId: string | undefined
			},
			RichPaymentDetail,
			never
		>
		[k: `PUT /api/v1/payments/?userId=${string}&paymentDetailId=${string}`]: Operation<
			string,
			'PUT',
			never,
			{
				paymentDetails: string
				paymentMethod: string
				stallId: string | undefined
			},
			RichPaymentDetail,
			never
		>
		[k: `DELETE /api/v1/payments/?paymentDetailId=${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
	}
}

export const persistPaymentMethodMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({
			paymentDetails,
			paymentMethod,
			stallId,
		}: {
			paymentDetails: string
			paymentMethod: string
			stallId: string | undefined
		}) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`POST /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: {
						paymentDetails,
						paymentMethod,
						stallId,
					},
				})
				return pd
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['paymentDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const updatePaymentMethodMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({
			paymentDetails,
			paymentMethod,
			stallId,
			paymentDetailId,
		}: {
			paymentDetails: string
			paymentMethod: string
			stallId: string | undefined
			paymentDetailId: string
		}) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`PUT /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}&paymentDetailId=${paymentDetailId}`, {
					auth: true,
					body: {
						paymentDetails,
						paymentMethod,
						stallId,
					},
				})
				return pd
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['paymentDetails', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const deletePaymentMethodMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ paymentDetailId, userId }: { paymentDetailId: string; userId: string }) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`DELETE /api/v1/payments/?paymentDetailId=${paymentDetailId}&userId=${userId}`, {
					auth: true,
				})
				return pd
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['paymentDetails', !!$ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)

export const userDataMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (profile: NDKUserProfile) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: profile,
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
			console.log(nostrEvent)
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
