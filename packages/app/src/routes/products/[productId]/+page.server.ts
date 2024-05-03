import { getProductById, getProductsByUserId } from '$lib/server/products.service'
import { getUserForProduct } from '$lib/server/users.service.js'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductById(params.productId)
	const seller = await getUserForProduct(product.id)
	const products = (await getProductsByUserId(seller.id)).slice(0, 4)
	return {
		product,
		seller,
		products,
	}
}
