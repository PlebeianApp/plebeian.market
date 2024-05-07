import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { Event } from 'nostr-tools'
import { error } from '@sveltejs/kit'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { standardDisplayDateFormat, takeUniqueOrThrow } from '$lib/utils'
import { format } from 'date-fns'

import type { Product } from '@plebeian/database'
import { db, devUser1, eq, products } from '@plebeian/database'

import { productEventSchema } from '../../schema/nostr-events'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'stockQty'> & {
	name: Product['productName']
	createdAt: string
	price: number
	mainImage: string
	galleryImages: string[]
}

export type ProductsFilter = {
	pageSize: number
	page: number
	orderBy: 'createdAt' | 'price'
	order: 'asc' | 'desc'
}

export const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	return {
		id: product.id,
		createdAt: format(product.createdAt, standardDisplayDateFormat),
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

export const getAllProducts = async (
	filter: ProductsFilter = {
		pageSize: 10,
		page: 1,
		orderBy: 'createdAt',
		order: 'asc',
	},
): Promise<DisplayProduct[]> => {
	const orderBy = {
		createdAt: products.createdAt,
		price: products.price,
	}[filter.orderBy]

	const productsResult = await db.query.products.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		orderBy: (products, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
	})

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
		createdAt: format(productResult.createdAt, standardDisplayDateFormat),
		name: productResult.productName,
		description: productResult.description,
		price: parseFloat(productResult.price),
		currency: productResult.currency,
		stockQty: productResult.stockQty,
		mainImage: images.mainImage,
		galleryImages: images.galleryImages,
	}
}

export const createProduct = async (productEvent: Event | NDKEvent): Promise<DisplayProduct> => {
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.parse({ id: productEvent.id, ...productEventContent })
	const insertProduct = {
		id: parsedProduct.id,
		description: parsedProduct.description as string,
		currency: parsedProduct.currency,
		price: parsedProduct.price.toString(),
		quantity: parsedProduct.quantity,
		specs: parsedProduct.specs,
		shipping: parsedProduct.shipping,
		images: parsedProduct.images,
		userId: devUser1.pk,
		stallId: parsedProduct.stall_id,
		productName: parsedProduct.name,
		stockQty: parsedProduct.quantity ?? 0,
	}

	const productResult = await db.insert(products).values(insertProduct).returning()

	if (productResult[0]) {
		return toDisplayProduct(productResult[0])
	}

	error(500, 'Failed to create product')
}

export const updateProduct = async (productId: string, productEvent: Event | NDKEvent): Promise<DisplayProduct> => {
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.partial().parse({ id: productId, ...productEventContent })
	const insertProduct = {
		id: parsedProduct.id,
		description: parsedProduct?.description as string,
		currency: parsedProduct?.currency,
		price: parsedProduct?.price?.toString(),
		quantity: parsedProduct?.quantity,
		specs: parsedProduct?.specs,
		shipping: parsedProduct?.shipping,
		images: parsedProduct?.images,
		userId: devUser1.pk,
		stallId: parsedProduct?.stall_id,
		productName: parsedProduct?.name,
		stockQty: parsedProduct?.quantity !== null ? parsedProduct?.quantity : undefined,
	}

	const productResult = await db
		.update(products)
		.set({
			updatedAt: new Date(),
			...insertProduct,
		})
		.where(eq(products.id, productId))
		.returning()

	if (productResult.length > 0) {
		return toDisplayProduct(productResult[0])
	}

	error(500, 'Failed to update product')
}

export const deleteProduct = async (productId: string): Promise<boolean> => {
	const productResult = await db.delete(products).where(eq(products.id, productId)).execute()

	if (productResult) {
		return true
	}

	error(500, 'Failed to delete product')
}
