import { Product, ProductImage, productImages } from '@plebeian/database'
import { db, eq, events, products } from '@plebeian/database'
import { error } from '@sveltejs/kit'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'stockQty'> & {
	name: Product['productName']
	images: ProductImage[]
}

export const getProductsByUserId = async (userId: string): Promise<DisplayProduct[]> => {
	const productsResult = db.select().from(products).where(eq(products.userId, userId)).all()

	const productsRes: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (productsRes.length) {
		return productsRes
	}

	error(404, 'Not found')
}

export const getHomeProducts = async () => {
	const productsQuery = db.select().from(products)

	const coolProductsResult = productsQuery.limit(6).all()
	const featuredProductsResult = productsQuery.where(eq(products.isFeatured, true)).limit(4).all()
	const eventsResult = db.select().from(events).limit(4).all()

	return {
		featured: await Promise.all(featuredProductsResult.map(toDisplayProduct)),
		cool: await Promise.all(coolProductsResult.map(toDisplayProduct)),
		events: eventsResult
	}
}

async function toDisplayProduct(p: Product): Promise<DisplayProduct> {
	const images = db.select().from(productImages).where(eq(productImages.productId, p.id)).all()

	return {
		id: p.id,
		name: p.productName,
		description: p.description,
		currency: p.currency,
		stockQty: p.stockQty,
		images
	}
}
