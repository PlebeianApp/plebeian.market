import { createQuery } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'

export type SettingsMeta = {
	id: string
	valueText: string
}

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/settings-meta?key=${string}`]: Operation<string, 'GET', never, never, SettingsMeta[], never>
	}
}

export const appSettingsMetaQuery = (key: string) =>
	createQuery<SettingsMeta[]>(
		{
			queryKey: ['settings-meta', key],
			queryFn: async () => {
				const response = await createRequest(`GET /api/v1/settings-meta?key=${key}`, { auth: true })
				return response
			},
		},
		queryClient,
	)
