import { toDisplayProduct } from '$lib/server/products.service'
import { db, eq, events, products } from '@plebeian/database'
import type { PageServerLoad } from './$types'

const getHomeProducts = async () => {
	const productsQuery = db.select().from(products)

	const coolProductsResult = await productsQuery.limit(6).execute()
	const featuredProductsResult = await productsQuery.where(eq(products.isFeatured, true)).limit(4).execute()
	const eventsResult = await db.select().from(events).limit(4).execute()

	return {
		featured: await Promise.all(featuredProductsResult.map(toDisplayProduct)),
		cool: await Promise.all(coolProductsResult.map(toDisplayProduct)),
		events: eventsResult
	}
}


export const load: PageServerLoad = () => {
	return getHomeProducts()
}
