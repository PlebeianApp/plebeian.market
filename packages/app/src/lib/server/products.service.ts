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

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'quantity' | 'userId' | 'identifier' | 'stallId'> & {
	name: Product['productName']
	userNip05: string | null
	createdAt: string
	price: number
	images: ProductImage[]
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
		quantity: product.quantity,
		images: images,
		stallId: product.stallId,
	}
}

export const getProductsByUserId = async (filter: ProductsFilter = productsFilterSchema.parse({})): Promise<DisplayProduct[]> => {
	const productsResult = await db
		.select()
		.from(products)
		.where(filter.userId ? eq(products.userId, filter.userId) : undefined)
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
		quantity: productResult.quantity,
		images: images,
		stallId: productResult.stallId,
	}
}

const preparedProductsByCatId = db
	.select({ ...getTableColumns(products) })
	.from(products)
	.innerJoin(productCategories, eq(products.id, productCategories.productId))
	.where(eq(productCategories.category, sql.placeholder('catId')))
	.limit(sql.placeholder('limit'))
	.offset(sql.placeholder('offset'))
	.prepare()

export const getProductsByCatId = async (filter: ProductsFilter): Promise<DisplayProduct[]> => {
	if (!filter.category) {
		throw new Error('Category ID must be provided')
	}

	const productRes = await preparedProductsByCatId.execute({
		catId: filter.category,
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	if (productRes) {
		return await Promise.all(productRes.map(toDisplayProduct))
	}
	error(404, 'not found')
}

export const createProduct = async (productEvent: NostrEvent) => {
	const eventCoordinates = getEventCoordinates(productEvent)
	const productEventContent = JSON.parse(productEvent.content)

	const parsedProduct = productEventSchema.safeParse({ id: productEventContent.id, ...productEventContent })
	if (!parsedProduct.success) error(500, 'Bad product schema' + parsedProduct.error)

	const stall = await getStallById(`${parsedProduct.data.stallId}`)
	const parentId = customTagValue(productEvent.tags, 'a')[0] || null
	const extraCost = parsedProduct.data.shipping?.length ? parsedProduct.data.shipping[0].cost : 0

	if (!stall) {
		error(400, 'Stall not found')
	}

	if (!parsedProduct.data.type) {
		parsedProduct.data.type = 'simple'
	}

	const insertProduct: Product = {
		id: eventCoordinates.coordinates,
		createdAt: new Date(productEvent.created_at! * 1000),
		updatedAt: new Date(productEvent.created_at! * 1000),
		identifier: eventCoordinates.tagD,
		productName: parsedProduct.data?.name as string,
		description: parsedProduct.data.description as string,
		currency: parsedProduct.data.currency as string,
		price: String(parsedProduct.data.price),
		extraCost: extraCost?.toString() || '0',
		productType: parsedProduct.data.type as ProductTypes,
		parentId: parentId,
		userId: productEvent.pubkey,
		stallId: parsedProduct.data.stallId as string,
		quantity: parsedProduct.data.quantity ?? 0,
	}
	const insertSpecs: ProductMeta[] | undefined = parsedProduct.data.specs?.map((spec) => ({
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

	const insertProductImages: ProductImage[] | undefined = parsedProduct.data.images?.map((imageUrl, index) => ({
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

	const tags = customTagValue(productEvent.tags, 't')
	if (tags.length) {
		await db
			.insert(categories)
			.values(tags.map((tag) => ({ id: createId(), name: tag, description: '', userId: productEvent.pubkey })))
			.onConflictDoNothing({
				target: categories.name,
			})
			.returning()
			.execute()

		const insertedCategories = await Promise.all(
			tags.map(async (tag) => (await db.query.categories.findFirst({ where: eq(categories.name, tag) }).execute())!),
		)

		await db
			.insert(productCategories)
			.values(insertedCategories.map(({ name }) => ({ productId: insertProduct.id, userId: productEvent.pubkey, category: name })))
			.execute()
	}

	if (productResult[0]) {
		return toDisplayProduct(productResult[0])
	}

	error(500, 'Failed to create product')
}

export const createProducts = async (productEvents: NostrEvent[]) => {
	try {
		const productPromises = productEvents.map(async (productEvent) => {
			try {
				const eventCoordinates = getEventCoordinates(productEvent)
				const productEventContent = JSON.parse(productEvent.content)
				const {
					data: parsedProduct,
					success,
					error: parseError,
				} = productEventSchema.safeParse({ id: productEventContent.id, ...productEventContent })

				if (!success) throw Error(`${parseError}`)

				if (!parsedProduct) {
					throw Error('Bad product schema')
				}

				const stall = parsedProduct.stallId.startsWith(`${KindStalls}`)
					? await getStallById(parsedProduct.stallId)
					: await getStallById(`${KindStalls}:${productEvent.pubkey}:${parsedProduct.stallId}`)

				const parentId = customTagValue(productEvent.tags, 'a')[0] || null
				const extraCost = parsedProduct.shipping.length ? parsedProduct.shipping[0].cost : 0

				if (!stall) throw Error('Stall not found')

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
					quantity: parsedProduct.quantity ?? 0,
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

				if (insertSpecs?.length) await db.insert(productMeta).values(insertSpecs).returning()

				if (insertProductImages?.length) await db.insert(productImages).values(insertProductImages).returning()

				if (productResult[0]) {
					return toDisplayProduct(productResult[0])
				} else {
					throw Error('Failed to create product')
				}
			} catch (e) {
				throw Error(`${e}`)
			}
		})
		const results = await Promise.all(productPromises)
		return results
	} catch (e) {
		error(500, { message: `Failed to create products: ${e}` })
	}
}

export const updateProduct = async (productId: string, productEvent: NostrEvent): Promise<DisplayProduct> => {
	const productEventContent = JSON.parse(productEvent.content)
	const { data: parsedProduct, success, error: parseError } = productEventSchema.safeParse(productEventContent)

	if (!success) {
		error(500, `Bad product schema ${parseError}`)
	}

	const insertProduct: Partial<Product> = {
		id: productId,
		description: parsedProduct?.description as string,
		updatedAt: new Date(),
		currency: parsedProduct?.currency,
		price: parsedProduct?.price?.toString(),
		extraCost: parsedProduct?.shipping?.length ? parsedProduct?.shipping[0].cost?.toString() : String(0),
		stallId: parsedProduct?.stallId,
		productName: parsedProduct?.name,
		quantity: parsedProduct?.quantity !== null ? parsedProduct?.quantity : undefined,
	}

	const existingImages = await getImagesByProductId(productId)

	const newImages = parsedProduct?.images?.filter((img) => !existingImages.find((eImg) => eImg.imageUrl === img))
	const removedImages = existingImages.map((img) => img.imageUrl).filter((img) => (img ? !parsedProduct?.images?.includes(img) : img))

	const removeProductImages = removedImages.map((imageUrl) => ({
		productId,
		imageUrl,
	}))

	if (newImages && newImages.length > 0) {
		await Promise.all(
			newImages.map((img) =>
				db
					.insert(productImages)
					.values({
						createdAt: new Date(),
						productId,
						auctionId: null,
						imageUrl: img,
						imageType: 'gallery',
						imageOrder: 0,
					})
					.returning(),
			),
		)
	}

	if (removeProductImages.length) {
		await Promise.all(
			removeProductImages.map((img) =>
				db
					.delete(productImages)
					.where(and(eq(productImages.productId, img.productId), img.imageUrl ? eq(productImages.imageUrl, img.imageUrl) : undefined))
					.execute(),
			),
		)
	}

	const productResult = await db
		.update(products)
		.set({
			...insertProduct,
		})
		.where(eq(products.id, productId))
		.returning()

	const tags = customTagValue(productEvent.tags, 't')
	if (tags.length) {
		await db
			.insert(categories)
			.values(tags.map((tag) => ({ id: createId(), name: tag, description: '', userId: productEvent.pubkey })))
			.onConflictDoNothing({
				target: categories.name,
			})
			.execute()

		const insertedCategories = await Promise.all(
			tags.map(async (tag) => (await db.query.categories.findFirst({ where: eq(categories.name, tag) }).execute())!),
		)

		await db.delete(productCategories).where(eq(productCategories.productId, productId)).execute()
		await db
			.insert(productCategories)
			.values(
				insertedCategories.map(({ name }) => ({ productId: insertProduct.id as string, userId: productEvent.pubkey, category: name })),
			)
			.execute()
	}

	if (productResult.length > 0) {
		return toDisplayProduct(productResult[0])
	}

	error(500, 'Failed to update product')
}

export const deleteProduct = async (productId: string, userId: string): Promise<string> => {
	const productResult = await db.query.products.findFirst({
		where: and(eq(products.id, productId), eq(products.userId, userId)),
	})

	if (!productResult) {
		error(404, 'Not found')
	}

	if (productResult.userId !== userId) {
		error(401, 'Unauthorized')
	}

	try {
		await db.delete(products).where(eq(products.id, productId)).execute()
		return productId
	} catch (e) {
		error(500, `Failed to delete product: ${e}`)
	}
}

const preparedProductsByCatName = db
	.select({ ...getTableColumns(products) })
	.from(products)
	.innerJoin(productCategories, eq(products.id, productCategories.productId))
	.innerJoin(categories, eq(productCategories.category, categories.name))
	.where(and(eq(categories.name, sql.placeholder('category')), eq(products.userId, sql.placeholder('userId'))))
	.limit(sql.placeholder('limit'))
	.offset(sql.placeholder('offset'))
	.prepare()

export const getProductsByCatName = async (filter: ProductsFilter): Promise<DisplayProduct[]> => {
	if (!filter.category) {
		throw new Error('Category Name must be provided')
	}

	const productRes = await preparedProductsByCatName.execute({
		userId: filter.userId,
		category: filter.category,
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	if (productRes) {
		return await Promise.all(productRes.map(toDisplayProduct))
	}
	throw error(404, 'not found')
}

export const productExists = async (productId: string): Promise<boolean> => {
	const result = await db
		.select({ id: sql`1` })
		.from(products)
		.where(eq(products.id, productId))
		.limit(1)
	return result.length > 0
}
