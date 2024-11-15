import { error } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { productExists } from '$lib/server/products.service'
import { URLProcessor } from '$lib/utils/url.utils'

import type { PageServerLoad } from './$types'

export interface ProductCheck {
	id: string
	identifier?: string
	exist: boolean
}

async function getProductInfo(productId: string): Promise<boolean> {
	try {
		return await productExists(productId)
	} catch (e) {
		console.warn('Product existence check failed:', e)
		return false
	}
}

export const load: PageServerLoad = async ({ params }) => {
	try {
		const urlComponents = await URLProcessor.parseURL(params.productId, {
			requireIdentifier: true,
			kind: KindProducts,
		})

		const productId = URLProcessor.buildCoordinateId(urlComponents)
		const [userInfo, productExists] = await Promise.all([Promise.resolve({ id: urlComponents.userId }), getProductInfo(productId)])

		return {
			productRes: {
				id: productId,
				identifier: urlComponents.identifier,
				exist: productExists,
			},
			user: userInfo,
		}
	} catch (e) {
		if (e instanceof Error && 'status' in e) throw e
		throw error(500, 'Error processing product data')
	}
}
