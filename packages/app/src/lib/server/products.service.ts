import { error } from '@sveltejs/kit'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { takeUniqueOrThrow } from '$lib/utils'

import type { Product } from '@plebeian/database'
import { db, eq, products } from '@plebeian/database'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'stockQty'> & {
	name: Product['productName']
	price: number
	mainImage: string
	galleryImages: string[]
}

export const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	return {
		id: product.id,
		name: product.productName,
		description: product.description,
		price: parseFloat(product.price),
		currency: product.currency,
		stockQty: product.stockQty,
		mainImage: images.mainImage,
		galleryImages: images.galleryImages,
	}
}

export const getProductsByUserId = async (userId: string): Promise<DisplayProduct[]> => {
	const productsResult = await db.select().from(products).where(eq(products.userId, userId)).execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getProductsByStallId = async (stallId: string): Promise<DisplayProduct[]> => {
	const productsResult = await db.select().from(products).where(eq(products.stallId, stallId)).execute()

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
		galleryImages: images.galleryImages,
	}
}
