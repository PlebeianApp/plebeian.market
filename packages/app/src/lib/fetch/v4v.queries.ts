import { createQuery } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'

type V4VURL = `/api/v1/v4v?userId=${string}`

interface V4VQueryParams {
	userId: string
}

export type V4VDTO = {
	amount: number
	target: string
}

function buildV4VURL({ userId }: V4VQueryParams): V4VURL {
	return `/api/v1/v4v?userId=${encodeURIComponent(userId)}`
}

declare module './client' {
	interface Endpoints {
		[k: `GET ${V4VURL}`]: Operation<string, 'GET', never, V4VDTO[], V4VDTO[], never>
	}
}

export const v4VForUserQuery = (userId: string) =>
	createQuery<V4VDTO[]>(
		{
			queryKey: ['v4v', userId],
			queryFn: async () => {
				try {
					return await createRequest(`GET ${buildV4VURL({ userId })}`, { auth: false })
				} catch (e) {
					return []
				}
			},
		},
		queryClient,
	)
