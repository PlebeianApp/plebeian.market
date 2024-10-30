import { decodeNpub, processNip05 } from '$lib/nostrSubs/load-utils'
import { isValidHexKey, isValidNip05, isValidNpub } from '$lib/utils/validation.utils'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }): Promise<{ userId: string }> => {
	const { userId: inputId } = params

	try {
		let processedUserId = ''

		if (isValidNip05(inputId)) {
			processedUserId = await processNip05(inputId)
		} else if (isValidNpub(inputId)) {
			processedUserId = decodeNpub(inputId) || ''
		} else if (isValidHexKey(inputId)) {
			processedUserId = inputId
		}

		return { userId: processedUserId }
	} catch (e) {
		console.error('Error processing user data:', e)
		return { userId: '' }
	}
}
