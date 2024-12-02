import type { SettingsMeta } from '$lib/server/appSettings.service'
import { createQuery } from '@tanstack/svelte-query'

import type { AppSettingsMetaName } from '@plebeian/database'

import { createRequest, queryClient } from './client'
import { createSettingsMetaKey } from './keys'

export type ForbiddenWordsQuery = {
	forbiddenWords: SettingsMeta[]
	forbiddenPattern: RegExp
}

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/settings-meta?key=${string}`]: Operation<string, 'GET', never, never, ForbiddenWordsQuery, never>
	}
}

export const appSettingsMetaQuery = (key: AppSettingsMetaName['value']) =>
	createQuery(
		{
			queryKey: createSettingsMetaKey(key),
			queryFn: async () => {
				const response = await createRequest(`GET /api/v1/settings-meta?key=${key}`, { auth: true })
				return response
			},
			staleTime: 1000 * 60 * 60,
		},
		queryClient,
	)
