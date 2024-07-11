import { toDisplayProduct } from '$lib/server/products.service'
import { getAppSettings } from '$lib/server/setup.service'

import type { AppSettings } from '@plebeian/database'
import { and, db, eq, getTableColumns, productMeta, products } from '@plebeian/database'

import type { PageServerLoad } from './$types'

const getHomeProducts = async () => {
	const productsQuery = db.select().from(products)

	const productsResult = await productsQuery.limit(8).execute()
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
		products: await Promise.all(productsResult.map(toDisplayProduct)),
	}
}

export const load: PageServerLoad = async () => {
	const homeProducts = await getHomeProducts()
	const appSettings = (await getAppSettings()) as AppSettings
	return { homeProducts, appSettings }
}
