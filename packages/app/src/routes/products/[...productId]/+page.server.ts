import { KindProducts } from '$lib/constants'
import { getProductById, getProductsByUserId } from '$lib/server/products.service'
import { getUserByNip05, getUserForProduct } from '$lib/server/users.service.js'
import { NIP05_REGEX } from 'nostr-tools/nip05'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	let userId
	let productSlug

	const [nip05, productId] = params.productId.split('/')
	if (NIP05_REGEX.test(nip05) && productId) {
		userId = (await getUserByNip05(nip05)).id
		productSlug = productId
	}

	const product = userId && productSlug ? await getProductById(`${KindProducts}:${userId}:${productSlug}`) : await getProductById(nip05)
	const seller = await getUserForProduct(product.id)
	const products = (await getProductsByUserId(seller.id)).slice(0, 4)

	return { product, seller, products }
}
