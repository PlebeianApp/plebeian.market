import { toDisplayProduct } from '$lib/server/products.service'

import { and, db, eq, getTableColumns, productMeta, products } from '@plebeian/database'

import type { PageServerLoad } from './$types'

const getHomeProducts = async () => {
	const productsQuery = db.select().from(products)

	const coolProductsResult = await productsQuery.limit(6).execute()
	const featuredProductsResult = await db
		.select({
			...getTableColumns(products),
		})
		.from(products)
		.innerJoin(productMeta, eq(products.id, productMeta.productId))
		.where(and(eq(productMeta.metaName, 'is_global_featured'), eq(productMeta.valueBoolean, true)))
		.execute()

	return {
		featured: await Promise.all(featuredProductsResult.map(toDisplayProduct)),
		cool: await Promise.all(coolProductsResult.map(toDisplayProduct)),
	}
}

export const load: PageServerLoad = () => {
	return getHomeProducts()
}
