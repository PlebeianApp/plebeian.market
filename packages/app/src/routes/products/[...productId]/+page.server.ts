import { error } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { URLProcessor } from '$lib/utils/url.utils'

import type { PageServerLoad } from './$types'

export interface ProductCheck {
	id: string
	identifier?: string
	exist: boolean
}

export const load: PageServerLoad = async ({ params }) => {
	try {
		const urlComponents = await URLProcessor.parseURL(params.productId, {
			requireIdentifier: true,
			kind: KindProducts,
		})

		const productId = URLProcessor.buildCoordinateId(urlComponents)

		return {
			productRes: {
				id: productId,
			},
			user: { id: urlComponents.userId },
		}
	} catch (e) {
		if (e instanceof Error && 'status' in e) throw e
		throw error(500, 'Error processing product data')
	}
}
