import { db, eq, type Product, products, events } from '@plebeian/database'
import { error } from '@sveltejs/kit'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { takeUniqueOrThrow } from '$lib/utils'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'stockQty'> & {
	name: Product['productName']
	price: number
	mainImage: string
	galleryImages: string[]
}

const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	return {
		id: product.id,
		name: product.productName,
		description: product.description,
		price: parseFloat(product.price),
		currency: product.currency,
		stockQty: product.stockQty,
		mainImage: images.mainImage,
		galleryImages: images.galleryImages
	}
}

export const getProductsByUserId = async (userId: string): Promise<DisplayProduct[]> => {
	const productsResult = await db
		.select()
		.from(products)
		.where(eq(products.userId, userId))
		.execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getProductsByStallId = async (stallId: string): Promise<DisplayProduct[]> => {
	const productsResult = await db
		.select()
		.from(products)
		.where(eq(products.stallId, stallId))
		.execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getAllProducts = async (): Promise<DisplayProduct[]> => {
	const productsResult = await db.select().from(products).execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getHomeProducts = async () => {
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

export const getProductById = async (productId: string): Promise<DisplayProduct> => {
	const product = await db.select().from(products).where(eq(products.id, productId)).execute()
	const productResult = takeUniqueOrThrow(product)

	if (!productResult) {
		error(404, 'Not found')
	}

	const images = await getImagesByProductId(productId)

	return {
		id: productResult.id,
		name: productResult.productName,
		description: productResult.description,
		price: parseFloat(productResult.price),
		currency: productResult.currency,
		stockQty: productResult.stockQty,
		mainImage: images.mainImage,
		galleryImages: images.galleryImages
	}
}
