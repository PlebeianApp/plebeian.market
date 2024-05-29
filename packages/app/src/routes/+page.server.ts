import { getAllCategories } from '$lib/server/categories.service'
import { toDisplayProduct } from '$lib/server/products.service'
import { isInitialSetup } from '$lib/server/setup.service'

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
	const initialSetup = await isInitialSetup()
	const homeProducts = await getHomeProducts()
	const categoriesRes = await getAllCategories()
	return { initialSetup, homeProducts, categoriesRes }
}

export const prerender = true
