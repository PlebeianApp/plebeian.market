import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { ProductsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { productsFilterSchema } from '$lib/schema'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { customTagValue, getEventCoordinates } from '$lib/utils'
import { format } from 'date-fns'

import type { Product, ProductImage, ProductMeta, ProductShipping, ProductTypes } from '@plebeian/database'
import {
	and,
	asc,
	count,
	createId,
	db,
	desc,
	eq,
	events,
	eventTags,
	getTableColumns,
	PRODUCT_META,
	productImages,
	productMeta,
	products,
	productShipping,
	sql,
} from '@plebeian/database'

import { productEventSchema } from '../../schema/nostr-events'
import { stallExists } from './stalls.service'
import { getNip05ByUserId } from './users.service'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'quantity' | 'userId' | 'identifier' | 'stallId'> & {
	name: Product['productName']
	userNip05: string | null
	createdAt: string
	price: number
	images: ProductImage[]
	shipping: ProductShipping[]
}

export const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	const userNip05 = await getNip05ByUserId(product.userId)

	const shipping = await db.query.productShipping.findMany({
		where: and(eq(productShipping.productId, product.id)),
	})

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
		stallId: product.stallId.startsWith(KindStalls.toString()) ? product.stallId.split(':')[2] : product.stallId,
		shipping,
	}
}

export const getProductsByUserId = async (filter: ProductsFilter = productsFilterSchema.parse({})) => {
	const productsResult = await db
		.select()
		.from(products)
		.where(filter.userId ? eq(products.userId, filter.userId) : undefined)
		.limit(filter.pageSize)
		.execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(products)
		.where(filter.userId ? eq(products.userId, filter.userId) : undefined)

	if (displayProducts) {
		return { total, products: displayProducts }
	}

	error(404, 'Not found')
}

export const getProductsByStallId = async (stallId: string, filter: ProductsFilter = productsFilterSchema.parse({})) => {
	const orderBy = {
		createdAt: products.createdAt,
		price: products.price,
	}[filter.orderBy]

	const productsResult = await db
		.select()
		.from(products)
		.orderBy(filter.order === 'asc' ? asc(orderBy) : desc(orderBy))
		.where(eq(products.stallId, stallId))
		.execute()

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	const [{ count: total } = { count: 0 }] = await db.select({ count: count() }).from(products).where(eq(products.stallId, stallId))

	if (displayProducts) {
		return { total, products: displayProducts }
	}

	error(404, 'Not found')
}

export const getAllProducts = async (filter: ProductsFilter = productsFilterSchema.parse({})) => {
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

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(products)
		.where(and(filter.userId ? eq(products.userId, filter.userId) : undefined))

	const displayProducts: DisplayProduct[] = await Promise.all(productsResult.map(toDisplayProduct))

	if (displayProducts) {
		return { total, products: displayProducts }
	}

	error(404, 'Not found')
}

export const getProductById = async (productId: string): Promise<DisplayProduct> => {
	const [productRes] = await db.select().from(products).where(eq(products.id, productId)).execute()

	if (!productRes) {
		error(404, 'Not found')
	}

	return await toDisplayProduct(productRes)
}

export const createProducts = async (productEvents: NostrEvent[]) => {
	try {
		const productPromises = productEvents.map(async (productEvent) => {
			try {
				const eventCoordinates = getEventCoordinates(productEvent)
				if (!eventCoordinates) {
					return
				}
				const productEventContent = JSON.parse(productEvent.content)

				const {
					data: parsedProduct,
					success,
					error: parseError,
				} = productEventSchema.safeParse({
					id: productEventContent.id,
					...productEventContent,
				})

				if (!success) {
					error(500, { message: `${parseError}` })
				}

				if (!parsedProduct) {
					throw Error('Bad product schema')
				}

				const stallId = parsedProduct.stallId?.startsWith(`${KindStalls}`)
					? parsedProduct.stallId
					: `${KindStalls}:${productEvent.pubkey}:${parsedProduct.stallId}`

				const stall = await stallExists(stallId)

				if (!stall) {
					throw Error('Stall not found')
				}

				const parentId = customTagValue(productEvent.tags, 'a')[0] || null

				const extraCost = parsedProduct.shipping?.length ? parsedProduct.shipping[0].cost : 0

				if (!parsedProduct.type) {
					parsedProduct.type = 'simple'
				}

				const insertProduct: Product = {
					id: eventCoordinates.coordinates,
					createdAt: new Date(productEvent.created_at * 1000),
					updatedAt: new Date(productEvent.created_at * 1000),
					identifier: eventCoordinates.tagD,
					productName: parsedProduct.name as string,
					description: parsedProduct.description as string,
					currency: parsedProduct.currency as string,
					price: String(parsedProduct.price),
					extraCost: extraCost?.toString() as string,
					productType: parsedProduct.type as ProductTypes,
					parentId: parentId,
					userId: productEvent.pubkey,
					stallId: stallId,
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
				await db.insert(events).values({
					id: eventCoordinates.coordinates,
					author: productEvent.pubkey,
					event: productEvent.content,
					kind: productEvent.kind!,
				})

				const productResult = await db.insert(products).values(insertProduct).returning()

				if (!productResult.length) {
					throw Error('Failed to insert product')
				}

				if (insertSpecs?.length) {
					await db.insert(productMeta).values(insertSpecs).returning()
				}

				if (insertProductImages?.length) {
					await db.insert(productImages).values(insertProductImages).returning()
				}
				// FIXME (#191) Right now this is just a basic filtering
				// if (parsedProduct.shipping?.length) {
				// 	const validShipping = parsedProduct.shipping.filter((s) => s.id && s.id.trim() !== '')
				// 	if (validShipping.length) {
				// 		await db
				// 			.insert(productShipping)
				// 			.values(
				// 				validShipping.map((s) => ({
				// 					cost: s.cost!,
				// 					shippingId: s.id!,
				// 					productId: eventCoordinates!.coordinates!,
				// 				})),
				// 			)
				// 			.execute()
				// 	} else {
				// 		console.log('No valid shipping entries to insert')
				// 	}
				// }

				if (productEvent.tags.length) {
					await db
						.insert(eventTags)
						.values(
							productEvent.tags.map((tag) => ({
								tagName: tag[0],
								tagValue: tag[1],
								secondTagValue: tag[2],
								thirdTagValue: tag[3],
								userId: productEvent.pubkey,
								eventId: eventCoordinates.coordinates,
								eventKind: productEvent.kind!,
							})),
						)
						.onConflictDoNothing({
							target: [eventTags.tagName, eventTags.tagValue, eventTags.eventId],
						})
						.execute()
				}

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
	const eventCoordinates = getEventCoordinates(productEvent)
	const productEventContent = JSON.parse(productEvent.content)
	const parsedProduct = productEventSchema.safeParse({
		id: productId,
		...productEventContent,
	})

	if (!parsedProduct.success) {
		error(500, `Bad product schema, ${parsedProduct.error}`)
	}

	const parsedProductData = parsedProduct.data

	const insertProduct: Partial<Product> = {
		id: productId,
		description: parsedProductData?.description as string,
		updatedAt: new Date(),
		currency: parsedProductData?.currency,
		price: parsedProductData?.price?.toString(),
		extraCost: parsedProductData?.shipping?.length ? parsedProductData?.shipping[0].cost?.toString() : String(0),
		stallId: parsedProductData?.stallId?.startsWith(KindStalls.toString())
			? parsedProductData?.stallId
			: `${KindStalls}:${productEvent.pubkey}:${parsedProductData?.stallId}`,
		productName: parsedProductData?.name,
		quantity: parsedProductData?.quantity !== null ? parsedProductData?.quantity : undefined,
	}
	const existingImages = await getImagesByProductId(productId)

	const newImages = parsedProductData?.images?.filter((img) => !existingImages.find((eImg) => eImg.imageUrl === img))
	const removedImages = existingImages.map((img) => img.imageUrl).filter((img) => (img ? !parsedProductData?.images?.includes(img) : img))

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

	await db.transaction(async (tx) => {
		await tx.delete(productShipping).where(eq(productShipping.productId, productId))
		for (const shipping of parsedProductData.shipping ?? []) {
			await tx
				.insert(productShipping)
				.values({
					cost: shipping.cost!,
					shippingId: shipping.id,
					productId: productId,
				})
				.execute()
		}
	})

	if (productEvent.tags.length) {
		await db
			.insert(eventTags)
			.values(
				productEvent.tags.map((tag) => ({
					tagName: tag[0],
					tagValue: tag[1],
					secondTagValue: tag[2],
					thirdTagValue: tag[3],
					userId: productEvent.pubkey,
					eventId: eventCoordinates?.coordinates as string,
					eventKind: productEvent.kind!,
				})),
			)
			.onConflictDoNothing({
				target: [eventTags.tagName, eventTags.tagValue, eventTags.eventId],
			})
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
	.leftJoin(eventTags, eq(products.id, eventTags.eventId))
	.where(and(eq(eventTags.tagValue, sql.placeholder('category')), eq(eventTags.tagName, 't')))
	.limit(sql.placeholder('limit'))
	.offset(sql.placeholder('offset'))
	.prepare()

export const getProductsByCatName = async (filter: ProductsFilter): Promise<{ total: number; products: DisplayProduct[] }> => {
	if (!filter.category) {
		throw new Error('Category Name must be provided')
	}

	const productRes = await preparedProductsByCatName.execute({
		userId: filter.userId,
		category: filter.category,
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	if (!productRes || productRes.length === 0) {
		throw error(404, 'Not found')
	}

	const displayProducts: DisplayProduct[] = await Promise.all(productRes.map(toDisplayProduct))

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(eventTags)
		.where(eq(eventTags.tagValue, filter.category))

	return { total, products: displayProducts }
}

export const productExists = async (productId: string): Promise<boolean> => {
	const result = await db
		.select({ id: sql`1` })
		.from(products)
		.where(eq(products.id, productId))
		.limit(1)
	return result.length > 0
}
