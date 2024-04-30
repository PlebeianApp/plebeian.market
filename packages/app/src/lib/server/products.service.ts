import { db, eq, type Product, products } from '@plebeian/database'
import { error } from '@sveltejs/kit'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { takeUniqueOrThrow } from '$lib/utils'

export type DisplayProduct = {
	id: string
	name: string
	description: string
	price: number
	currency: string
	stockQty: number
	mainImage: string
	galleryImages: string[]
}

const dbProductToDisplayProduct = (product: Product): DisplayProduct => {
	const images = getImagesByProductId(product.id)
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

export const getProductsByUserId = (userId: string): DisplayProduct[] => {
	const productsResult = db.select().from(products).where(eq(products.userId, userId)).all()

	const displayProducts: DisplayProduct[] = productsResult.map(dbProductToDisplayProduct)

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getProductsByStallId = (stallId: string): DisplayProduct[] => {
	const productsResult = db.select().from(products).where(eq(products.stallId, stallId)).all()

	const displayProducts: DisplayProduct[] = productsResult.map(dbProductToDisplayProduct)

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getAllProducts = (): DisplayProduct[] => {
	const productsResult = db.select().from(products).all()

	const displayProducts: DisplayProduct[] = productsResult.map(dbProductToDisplayProduct)

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getProductById = (productId: string): DisplayProduct => {
	const product = db.select().from(products).where(eq(products.id, productId)).all()
	const productResult = takeUniqueOrThrow(product)

	if (!productResult) {
		error(404, 'Not found')
	}

	const images = getImagesByProductId(productId)

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
