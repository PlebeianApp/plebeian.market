import { KindProducts } from '$lib/constants'
import { getCategoriesByProductId } from '$lib/server/categories.service'
import { getProductById, getProductsByUserId } from '$lib/server/products.service'
import { getUserByNip05, getUserForProduct } from '$lib/server/users.service.js'
import { NIP05_REGEX } from 'nostr-tools/nip05'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	let userId: string | undefined
	let productIdentifier: string | undefined

	const parts: string[] = params.productId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		throw new Error('Invalid productId format')
	}

	const [root, productId] = parts

	if (NIP05_REGEX.test(root) && productId) {
		userId = (await getUserByNip05(root)).id
		productIdentifier = productId
	}

	const product =
		userId && productIdentifier ? await getProductById(`${KindProducts}:${userId}:${productIdentifier}`) : await getProductById(root)
	const seller = await getUserForProduct(product.id)
	const products = (await getProductsByUserId(seller.id)).slice(0, 4)
	const productCats =
		userId && productIdentifier
			? await getCategoriesByProductId(`${KindProducts}:${userId}:${productIdentifier}`)
			: await getCategoriesByProductId(root)
	return { product, seller, products, productCats }
}
