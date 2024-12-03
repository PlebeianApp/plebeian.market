import { createMutation } from '@tanstack/svelte-query'

import type { ForbiddenWordsQuery } from './settingsMeta.queries'
import { createRequest, queryClient } from './client'
import { settingsKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/settings-meta': Operation<string, 'POST', never, { word: string }, { success: boolean }, never>
		'DELETE /api/v1/settings-meta': Operation<string, 'DELETE', never, { wordId: string }, { success: boolean }, never>
	}
}

export const addForbiddenWordMutation = createMutation(
	{
		mutationFn: async (word: string) =>
			createRequest('POST /api/v1/settings-meta', {
				auth: true,
				body: { word },
			}),
		onSuccess: (data, addedWord) => {
			if (!data.success) return

			const queryKey = settingsKeys.meta('word_blacklist')
			queryClient.setQueryData(queryKey, (prevList?: string[]) => (prevList ? [...prevList, addedWord] : [addedWord]))
		},
	},
	queryClient,
)

export const deleteForbiddenWordMutation = createMutation(
	{
		mutationFn: async (wordId: string) =>
			createRequest('DELETE /api/v1/settings-meta', {
				auth: true,
				body: { wordId },
			}),
		onSuccess: (data, deletedWordId) => {
			if (!data.success) return

			queryClient.setQueryData(settingsKeys.meta('word_blacklist'), (prevData?: ForbiddenWordsQuery) => ({
				forbiddenWords: prevData?.forbiddenWords.filter((word) => word.id !== deletedWordId) ?? [],
			}))
		},
	},
	queryClient,
)
