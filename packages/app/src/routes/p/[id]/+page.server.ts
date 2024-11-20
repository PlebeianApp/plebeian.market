import { URLProcessor } from '$lib/utils/url.utils'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }): Promise<{ id: string }> => {
	try {
		const { userId } = await URLProcessor.parseURL(params.id)
		return { id: userId }
	} catch (e) {
		console.error('Error processing user data:', e)
		return { id: '' }
	}
}
