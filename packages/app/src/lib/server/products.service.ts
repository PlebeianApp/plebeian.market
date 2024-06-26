import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { ProductsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { productsFilterSchema } from '$lib/schema'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { customTagValue, getEventCoordinates } from '$lib/utils'
import { format } from 'date-fns'

import type { Product, ProductImage, ProductMeta, ProductTypes } from '@plebeian/database'
import {
	and,
	categories,
	createId,
	db,
	devUser1,
	eq,
	getTableColumns,
	PRODUCT_META,
	productCategories,
	productImages,
	productMeta,
	products,
	sql,
} from '@plebeian/database'

import { productEventSchema } from '../../schema/nostr-events'
import { getStallById } from './stalls.service'
import { getNip05ByUserId } from './users.service'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'stockQty' | 'userId' | 'identifier' | 'stallId'> & {
	name: Product['productName']
	userNip05: string | null
	createdAt: string
	price: number
	images: string[]
}

export const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	const userNip05 = await getNip05ByUserId(product.userId)
	return {
		id: product.id,
		identifier: product.identifier,
		userId: product.userId,
		userNip05: userNip05,
		createdAt: format(product.createdAt, standardDisplayDateFormat),
		name: product.productName,
		description: product.description,
		price: parseFloat(product.price),
		currency: product.currency,
		stockQty: product.stockQty,
		images: images,
		stallId: product.stallId,
	}
}

export const getProductsByUserId = async (filter: ProductsFilter = productsFilterSchema.parse({})): Promise<DisplayProduct[]> => {
	const productsResult = await db
		.select()
		.from(products)
		.where(and(filter.userId ? eq(products.userId, filter.userId) : undefined))
		.limit(filter.pageSize)
		.execute()

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

export const getAllProducts = async (filter: ProductsFilter = productsFilterSchema.parse({})): Promise<DisplayProduct[]> => {
	const orderBy = {
		createdAt: products.createdAt,
		price: products.price,
	}[filter.orderBy]

	const productsResult = await db.query.products.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		orderBy: (products, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
		where: and(filter.userId ? eq(products.userId, filter.userId) : undefined),
	})

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return displayProducts
	}

	error(404, 'Not found')
}

export const getProductById = async (productId: string): Promise<DisplayProduct> => {
	const [productResult] = await db.select().from(products).where(eq(products.id, productId)).execute()

	if (!productResult) {
		error(404, 'Not found')
	}

	const images = await getImagesByProductId(productId)
	const userNip05 = await getNip05ByUserId(productResult.userId)

	return {
		id: productResult.id,
		identifier: productResult.identifier,
		userId: productResult.userId,
		userNip05: userNip05,
		createdAt: format(productResult.createdAt, standardDisplayDateFormat),
		name: productResult.productName,
		description: productResult.description,
		price: parseFloat(productResult.price),
		currency: productResult.currency,
		stockQty: productResult.stockQty,
		images: images,
		stallId: productResult.stallId,
	}
}

const preparedProductsByCatId = db
	.select({ ...getTableColumns(products) })
	.from(products)
	.innerJoin(productCategories, eq(products.id, productCategories.productId))
	.where(eq(productCategories.catId, sql.placeholder('catId')))
	.limit(sql.placeholder('limit'))
	.offset(sql.placeholder('offset'))
	.prepare()

export const getProductsByCatId = async (filter: ProductsFilter): Promise<DisplayProduct[]> => {
	if (!filter.catId) {
		throw new Error('Category ID must be provided')
	}

	const productRes = await preparedProductsByCatId.execute({
		catId: filter.catId,
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	if (productRes) {
		return await Promise.all(productRes.map(toDisplayProduct))
	}
	error(404, 'not found')
}

const preparedProductsByCatName = db
	.select({ ...getTableColumns(products) })
	.from(products)
	.innerJoin(productCategories, eq(products.id, productCategories.productId))
	.innerJoin(categories, eq(productCategories.catId, categories.id))
	.where(eq(categories.name, sql.placeholder('catName')))
	.limit(sql.placeholder('limit'))
	.offset(sql.placeholder('offset'))
	.prepare()

export const getProductsByCatName = async (filter: ProductsFilter): Promise<DisplayProduct[]> => {
	if (!filter.catName) {
		throw new Error('Category Name must be provided')
	}

	const productRes = await preparedProductsByCatName.execute({
		catName: filter.catName,
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	if (productRes) {
		return await Promise.all(productRes.map(toDisplayProduct))
	}
	throw error(404, 'not found')
}

export const createProduct = async (productEvent: NostrEvent) => {
	const eventCoordinates = getEventCoordinates(productEvent)
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.parse({ id: productEventContent.id, ...productEventContent })
	if (!parsedProduct) error(500, { message: 'Bad product schema' })

	const stall = await getStallById(parsedProduct.stall_id)
	const parentId = customTagValue(productEvent.tags, 'a')[0] || null
	const extraCost = parsedProduct.shipping.length ? parsedProduct.shipping[0].cost : 0

	if (!stall) {
		error(400, 'Stall not found')
	}

	if (!parsedProduct.type) {
		parsedProduct.type = 'simple'
	}

	const insertProduct: Product = {
		id: eventCoordinates.coordinates,
		createdAt: new Date(productEvent.created_at! * 1000),
		updatedAt: new Date(productEvent.created_at! * 1000),
		identifier: eventCoordinates.tagD,
		productName: parsedProduct.name,
		description: parsedProduct.description as string,
		currency: parsedProduct.currency,
		price: parsedProduct.price.toString(),
		extraCost: extraCost?.toString() as string,
		productType: parsedProduct.type as ProductTypes,
		parentId: parentId,
		userId: productEvent.pubkey,
		stallId: parsedProduct.stall_id,
		stockQty: parsedProduct.quantity ?? 0,
	}
	const insertSpecs: ProductMeta[] | undefined = parsedProduct.specs?.map((spec) => ({
		id: createId(),
		createdAt: new Date(productEvent.created_at! * 1000),
		updatedAt: new Date(productEvent.created_at! * 1000),
		productId: eventCoordinates.coordinates,
		auctionId: null,
		metaName: PRODUCT_META.SPEC.value,
		key: spec[0],
		valueText: spec[1],
		valueBoolean: null,
		valueInteger: null,
		valueNumeric: null,
	}))

	const insertProductImages: ProductImage[] | undefined = parsedProduct.images?.map((imageUrl, index) => ({
		createdAt: new Date(productEvent.created_at! * 1000),
		productId: eventCoordinates.coordinates,
		auctionId: null,
		imageUrl,
		imageType: 'gallery',
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

export const createProducts = async (productEvents: NostrEvent[]) => {
	try {
		const productPromises = productEvents.map(async (productEvent) => {
			const eventCoordinates = getEventCoordinates(productEvent)
			const productEventContent = JSON.parse(productEvent.content)
			const parsedProduct = productEventSchema.parse({ id: productEventContent.id, ...productEventContent })

			if (!parsedProduct) {
				error(500, { message: 'Bad product schema' })
			}

			const stall = parsedProduct.stall_id.startsWith(`${KindStalls}`)
				? await getStallById(parsedProduct.stall_id)
				: await getStallById(`${KindStalls}:${productEvent.pubkey}:${parsedProduct.stall_id}`)

			const parentId = customTagValue(productEvent.tags, 'a')[0] || null
			const extraCost = parsedProduct.shipping.length ? parsedProduct.shipping[0].cost : 0
			if (!stall) {
				error(400, { message: 'Stall not found' })
			}

			if (!parsedProduct.type) {
				parsedProduct.type = 'simple'
			}

			const insertProduct: Product = {
				id: eventCoordinates.coordinates,
				createdAt: new Date(productEvent.created_at * 1000),
				updatedAt: new Date(productEvent.created_at * 1000),
				identifier: eventCoordinates.tagD,
				productName: parsedProduct.name,
				description: parsedProduct.description as string,
				currency: parsedProduct.currency,
				price: parsedProduct.price.toString(),
				extraCost: extraCost?.toString() as string,
				productType: parsedProduct.type as ProductTypes,
				parentId: parentId,
				userId: productEvent.pubkey,
				stallId: stall.id,
				stockQty: parsedProduct.quantity ?? 0,
			}

			const insertSpecs: ProductMeta[] | undefined = parsedProduct.specs?.map((spec) => ({
				id: createId(),
				createdAt: new Date(productEvent.created_at * 1000),
				updatedAt: new Date(productEvent.created_at * 1000),
				productId: eventCoordinates.coordinates,
				auctionId: null,
				metaName: PRODUCT_META.SPEC.value,
				key: spec[0],
				valueText: spec[1],
				valueBoolean: null,
				valueInteger: null,
				valueNumeric: null,
			}))

			const insertProductImages: ProductImage[] | undefined = parsedProduct.images?.map((imageUrl, index) => ({
				createdAt: new Date(productEvent.created_at * 1000),
				productId: eventCoordinates.coordinates,
				auctionId: null,
				imageUrl,
				imageType: 'gallery',
				imageOrder: index + 1,
			}))

			const productResult = await db.insert(products).values(insertProduct).returning()

			if (insertSpecs?.length) {
				await db.insert(productMeta).values(insertSpecs).returning()
			}

			if (insertProductImages?.length) {
				await db.insert(productImages).values(insertProductImages).returning()
			}

			if (productResult[0]) {
				return toDisplayProduct(productResult[0])
			} else {
				error(500, { message: 'Failed to create product' })
			}
		})

		const results = await Promise.all(productPromises)
		return results
	} catch (e) {
		console.error('Error creating products:', e)
		error(500, { message: `Failed to create products: ${e}` })
	}
}

export const updateProduct = async (productId: string, productEvent: NostrEvent): Promise<DisplayProduct> => {
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.partial().parse({ id: productId, ...productEventContent })
	const insertProduct: Partial<Product> = {
		id: parsedProduct.id,
		description: parsedProduct?.description as string,
		updatedAt: new Date(),
		currency: parsedProduct?.currency,
		price: parsedProduct?.price?.toString(),
		extraCost: parsedProduct?.shipping?.length ? parsedProduct?.shipping[0]?.cost?.toString() : String(0),
		userId: devUser1.pk,
		stallId: parsedProduct?.stall_id,
		productName: parsedProduct?.name,
		stockQty: parsedProduct?.quantity !== null ? parsedProduct?.quantity : undefined,
	}

	const productResult = await db
		.update(products)
		.set({
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
