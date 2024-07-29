import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'

interface V4VFilter {
	amount: string
	target: string
}

interface V4VSearchParams {
	userId: string
	v4vPlatformShare: string
	target: string
}
type V4VURL = `/api/v1/v4v?userId=${string}&v4vPlatformShare=${string}&target=${string}`

function buildV4VURL(params: V4VSearchParams): V4VURL {
	const searchParams = new URLSearchParams({
		userId: params.userId,
		v4vPlatformShare: params.v4vPlatformShare,
		target: params.target,
	})
	return `/api/v1/v4v?${searchParams.toString()}` as V4VURL
}

declare module './client' {
	interface Endpoints {
		[k: `PUT ${V4VURL}`]: Operation<string, 'PUT', never, V4VFilter, number, never>
	}
}

export const setV4VForUserMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (v4vFilter: V4VFilter) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const params: V4VSearchParams = {
					userId: $ndkStore.activeUser.pubkey,
					v4vPlatformShare: v4vFilter.amount,
					target: v4vFilter.target,
				}
				const setAmount = await createRequest(`PUT ${buildV4VURL(params)}`, {
					auth: true,
				})
				return setAmount
			}

			return 0
		},
		onSuccess: (amount: number) => {
			const $ndkStore = get(ndkStore)

			queryClient.invalidateQueries({ queryKey: ['v4v', $ndkStore.activeUser?.pubkey] })
		},
	},
	queryClient,
)
