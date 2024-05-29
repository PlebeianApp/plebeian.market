import { getCategoryById } from '$lib/server/categories.service'
import { getProductsByCatId } from '$lib/server/products.service'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { catId } = params
	const products = await getProductsByCatId(catId)
	return { products: products }
}
