// payments.mutations.ts
import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { toast } from 'svelte-sonner'
import { get } from 'svelte/store'

import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

import { createRequest, queryClient } from './client'
import { paymentKeys } from './query-key-factory'
import { persistOnChainIndexWalletMutation } from './wallets.mutations'

export type PostStall = {
	paymentDetails: string
	paymentMethod: string
	stallId: string | null
	isDefault: boolean
}

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/payments/?userId=${string}`]: Operation<string, 'POST', never, PostStall, RichPaymentDetail, never>
		[k: `PUT /api/v1/payments/?userId=${string}&paymentDetailId=${string}`]: Operation<
			string,
			'PUT',
			never,
			PostStall,
			RichPaymentDetail,
			never
		>
		[k: `DELETE /api/v1/payments/?paymentDetailId=${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
		[k: `POST /api/v1/payments/${string}/?paymentDetailId=${string}`]: Operation<string, 'POST', never, never, RichPaymentDetail, never>
	}
}

export const persistPaymentMethodMutation = createMutation(
	{
		mutationFn: async ({ paymentDetails, paymentMethod, stallId, isDefault }: PostStall) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`POST /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: {
						paymentDetails,
						paymentMethod,
						stallId,
						isDefault,
					},
				})

				if (paymentMethod === PAYMENT_DETAILS_METHOD.ON_CHAIN && !paymentDetails.startsWith('bc1')) {
					await get(persistOnChainIndexWalletMutation).mutateAsync({ paymentDetailId: pd.id, index: 0 })
				}

				toast.success('Payment created')
				return pd
			}
			toast.error(`Payment not created`)
			return null
		},
		onSuccess: (data: RichPaymentDetail | null) => {
			if (!data) return

			queryClient.setQueryData(paymentKeys.private(data.userId), (prevData?: RichPaymentDetail[]) => {
				if (!prevData) return [data]

				if (data.isDefault) {
					prevData = prevData.map((pd) => ({
						...pd,
						isDefault: false,
					}))
				}

				return [...prevData, data]
			})
		},
	},
	queryClient,
)

export const updatePaymentMethodMutation = createMutation(
	{
		mutationFn: async ({ paymentDetails, paymentMethod, stallId, paymentDetailId, isDefault }: PostStall & { paymentDetailId: string }) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`PUT /api/v1/payments/?userId=${$ndkStore.activeUser.pubkey}&paymentDetailId=${paymentDetailId}`, {
					auth: true,
					body: {
						paymentDetails,
						paymentMethod,
						stallId,
						isDefault,
					},
				})
				toast.success('Payment updated')
				return pd
			}
			toast.error(`Payment not updated`)
			return null
		},
		onSuccess: (data: RichPaymentDetail | null) => {
			if (!data) return
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return

			queryClient.setQueryData(paymentKeys.private($ndkStore.activeUser.pubkey), (prevData?: RichPaymentDetail[]) => {
				if (!prevData) return [data]
				return prevData.map((pd) => (pd.id === data.id ? { ...pd, ...data } : data.isDefault ? { ...pd, isDefault: false } : pd))
			})
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
				return { paymentDetailId, userId: $ndkStore.activeUser.pubkey }
			}
			return null
		},
		onSuccess: (data: { paymentDetailId: string; userId: string } | null) => {
			if (!data) return

			queryClient.setQueryData(
				paymentKeys.private(data.userId),
				(prevData?: RichPaymentDetail[]) => prevData?.filter((pd) => pd.id !== data.paymentDetailId) ?? [],
			)
		},
	},
	queryClient,
)

export const setDefaultPaymentMethodForStallMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ stallId, paymentDetailId }: { stallId: string; paymentDetailId: string }) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const pd = await createRequest(`POST /api/v1/payments/${stallId}/?paymentDetailId=${paymentDetailId}`, {
					auth: true,
				})
				return { ...pd, userId: $ndkStore.activeUser.pubkey }
			}
			return null
		},
		onSuccess: (data: RichPaymentDetail | null) => {
			if (!data) return

			queryClient.setQueryData(paymentKeys.private(data.userId), (prevData?: RichPaymentDetail[]) => {
				if (!prevData) return [data]
				return prevData.map((pd) => ({
					...pd,
					isDefault: pd.id === data.id,
					stallId: pd.id === data.id ? data.stallId : pd.stallId,
				}))
			})
		},
	},
	queryClient,
)
