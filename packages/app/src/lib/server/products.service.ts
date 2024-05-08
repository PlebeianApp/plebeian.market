import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { Event } from 'nostr-tools'
import { error } from '@sveltejs/kit'
import { standardDisplayDateFormat } from '$lib/constants'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { customTagValue, getEventCoordinates, takeUniqueOrThrow } from '$lib/utils'
import { format } from 'date-fns'

import type { Product, ProductImage, ProductMeta } from '@plebeian/database'
import { createId, db, devUser1, eq, productImages, productImagesType, productMeta, productMetaTypes, products } from '@plebeian/database'

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

export const createProduct = async (productEvent: Event | NDKEvent) => {
	const eventCoordinates = getEventCoordinates(productEvent)
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.parse({ id: productEventContent.id, ...productEventContent })
	if (!parsedProduct) throw Error('Bad product schema')

	const parentId = customTagValue(productEvent.tags, 'a')[0] || null
	const extraCost = (parsedProduct.shipping && parsedProduct.shipping[0].cost) || 0

	if (!parsedProduct.type) {
		parsedProduct.type = 'simple'
	}

	const insertProduct: Product = {
		id: eventCoordinates.coordinates,
		createdAt: new Date(productEvent.created_at!),
		updatedAt: new Date(),
		identifier: eventCoordinates.tagD,
		productName: parsedProduct.name,
		description: parsedProduct.description as string,
		currency: parsedProduct.currency,
		price: parsedProduct.price.toString(),
		extraCost: extraCost.toString(),
		productType: parsedProduct.type,
		parentId: parentId,
		userId: productEvent.pubkey,
		stallId: parsedProduct.stall_id,
		stockQty: parsedProduct.quantity ?? 0,
	}
	const insertSpecs: ProductMeta[] | undefined = parsedProduct.specs?.map((spec) => ({
		id: createId(),
		createdAt: new Date(productEvent.created_at!),
		updatedAt: new Date(),
		productId: eventCoordinates.coordinates,
		metaName: productMetaTypes[5].name,
		key: spec[0],
		valueText: spec[1],
		valueBoolean: null,
		valueInteger: null,
		valueNumeric: null,
	}))

	const insertProductImages: ProductImage[] | undefined = parsedProduct.images?.map((imageUrl, index) => ({
		createdAt: new Date(),
		productId: eventCoordinates.coordinates,
		imageUrl,
		imageType: productImagesType[0],
		imageOrder: index + 1,
	}))

	const productResult = await db.insert(products).values(insertProduct).returning()

	insertSpecs?.length && (await db.insert(productMeta).values(insertSpecs).returning())
	insertProductImages?.length && (await db.insert(productImages).values(insertProductImages).returning())

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
