import { createQuery } from '@tanstack/svelte-query'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import { createRequest, queryClient } from './client'

type V4VURL = `/api/v1/v4v?userId=${string}&target=${string}`

interface V4VQueryParams {
	userId: string
	target: string
}

function buildV4VURL({ userId, target }: V4VQueryParams): V4VURL {
	return `/api/v1/v4v?userId=${encodeURIComponent(userId)}&target=${encodeURIComponent(target)}`
}

declare module './client' {
	interface Endpoints {
		[k: `GET ${V4VURL}`]: Operation<
			string,
			'GET',
			never,
			{
				amount: string
				target: string
			},
			number,
			never
		>
	}
}

export const platformV4VForUserQuery = (target: string) =>
	createQuery(
		derived(ndkStore, ($ndkStore) => ({
			queryKey: ['v4v', $ndkStore.activeUser?.pubkey],
			queryFn: async () => {
				const { activeUser } = $ndkStore
				if (!activeUser?.pubkey) return null
				return createRequest(`GET ${buildV4VURL({ userId: activeUser.pubkey, target })}`, { auth: false })
			},
			enabled: !!$ndkStore.activeUser?.pubkey,
		})),
		queryClient,
	)
