import { createMutation } from '@tanstack/svelte-query'

import { createRequest, queryClient } from './client'
import { createSettingsMetaKey } from './keys'

declare module './client' {
	interface Endpoints {
		'POST /api/v1/settings-meta': Operation<string, 'POST', never, { word: string }, { success: boolean }, never>
		'DELETE /api/v1/settings-meta': Operation<string, 'DELETE', never, { wordId: string }, { success: boolean }, never>
	}
}

export const addForbiddenWordMutation = createMutation(
	{
		mutationFn: async (word: string) => {
			const response = await createRequest('POST /api/v1/settings-meta', {
				auth: true,
				body: { word },
			})
			return response
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: createSettingsMetaKey('word_blacklist') })
		},
	},
	queryClient,
)

export const deleteForbiddenWordMutation = createMutation(
	{
		mutationFn: async (wordId: string) => {
			const response = await createRequest('DELETE /api/v1/settings-meta', {
				auth: true,
				body: { wordId },
			})
			return response
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: createSettingsMetaKey('word_blacklist') })
		},
	},
	queryClient,
)
