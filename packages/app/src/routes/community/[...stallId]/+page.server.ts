import { error } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { URLProcessor } from '$lib/utils/url.utils'

import type { PageServerLoad } from './$types'

export type StallCheck = {
	id: string
	identifier?: string
}

const getStallInfo = async (stallId: string, stallIdentifier?: string): Promise<StallCheck> => ({
	id: stallId,
	identifier: stallIdentifier,
})

export const load: PageServerLoad = async ({ params }) => {
	try {
		const urlComponents = await URLProcessor.parseURL(params.stallId, {
			requireIdentifier: true,
			kind: KindStalls,
		})

		const stallId = URLProcessor.buildCoordinateId(urlComponents)
		const [userInfo, stallInfo] = await Promise.all([
			Promise.resolve({ id: urlComponents.userId }),
			getStallInfo(stallId, urlComponents.identifier),
		])

		return { stall: stallInfo, user: userInfo }
	} catch (e) {
		if (e instanceof Error && 'status' in e) throw e
		throw error(500, 'Error processing stall data')
	}
}
