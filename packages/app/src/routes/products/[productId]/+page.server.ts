import { getUserUserForProduct } from '$lib/server/users.service.js'
import { getProductById, getProductsByUserId } from '$lib/server/products.service'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const product = getProductById(params.productId)
	const seller = getUserUserForProduct(product.id)
	const sellersProducts = getProductsByUserId(seller.id).slice(0, 4)
	return {
		product,
		seller,
		sellersProducts
	}
}
