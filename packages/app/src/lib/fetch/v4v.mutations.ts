import { createMutation } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { V4VDTO } from './v4v.queries'
import { createRequest, queryClient } from './client'
import { paymentKeys } from './query-key-factory'

interface V4VPostParams {
	userId: string
}
type V4VURL = `/api/v1/v4v?userId=${string}`

function buildV4VURL(params: V4VPostParams): V4VURL {
	const searchParams = new URLSearchParams({
		userId: params.userId,
	})
	return `/api/v1/v4v?${searchParams.toString()}` as V4VURL
}

declare module './client' {
	interface Endpoints {
		[k: `PUT ${V4VURL}`]: Operation<string, 'PUT', never, V4VDTO[], number, never>
	}
}

export const setV4VForUserMutation = createMutation(
	{
		mutationFn: async (v4vFilter: V4VDTO[]) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const params: V4VPostParams = {
					userId: $ndkStore.activeUser.pubkey,
				}
				const setAmount = await createRequest(`PUT ${buildV4VURL(params)}`, {
					auth: true,
					body: v4vFilter,
				})
				return setAmount
			}

			return 0
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			if (!$ndkStore.activeUser?.pubkey) return
			queryClient.invalidateQueries({ queryKey: paymentKeys.v4v($ndkStore.activeUser?.pubkey) })
		},
	},
	queryClient,
)
