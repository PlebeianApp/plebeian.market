import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { ProductsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { KindProducts, KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { productsFilterSchema } from '$lib/schema'
import { getImagesByProductId } from '$lib/server/productImages.service'
import { customTagValue, getEventCoordinates, parseCoordinatesString } from '$lib/utils'
import { format } from 'date-fns'

import type { Product, ProductImage, ProductMeta, ProductShipping, ProductTypes } from '@plebeian/database'
import {
	and,
	asc,
	count,
	createId,
	createShippingCoordinates,
	db,
	desc,
	eq,
	events,
	eventTags,
	getTableColumns,
	inArray,
	like,
	PRODUCT_IMAGES_TYPE,
	PRODUCT_META,
	productImages,
	productMeta,
	products,
	productShipping,
	sql,
} from '@plebeian/database'

import { createProductEventSchema } from '../../schema/nostr-events'
import { cachedPattern } from './appSettings.service'
import { stallExists } from './stalls.service'
import { getNip05ByUserId } from './users.service'

export type DisplayProduct = Pick<Product, 'id' | 'description' | 'currency' | 'quantity' | 'userId' | 'identifier' | 'stallId'> & {
	name: Product['productName']
	userNip05: string | null
	createdAt: string
	price: number
	images: ProductImage[]
	shipping: ProductShipping[]
	categories?: string[]
}

export const toDisplayProduct = async (product: Product): Promise<DisplayProduct> => {
	const images = await getImagesByProductId(product.id)
	const userNip05 = await getNip05ByUserId(product.userId)

	const shipping = await db.query.productShipping.findMany({
		where: eq(productShipping.productId, product.id),
	})

	const categories = await db.query.eventTags.findMany({
		where: and(eq(eventTags.eventId, product.id), eq(eventTags.tagName, 't')),
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
		stallId: parseCoordinatesString(product.stallId).tagD!,
		shipping,
		categories: categories.map((c) => c.tagValue),
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
		where: and(
			filter.userId ? eq(products.userId, filter.userId) : undefined,
			filter.search ? like(products.productName, `%${filter.search.replaceAll(' ', '%')}%`) : undefined,
		),
	})

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(products)
		.where(
			and(
				filter.userId ? eq(products.userId, filter.userId) : undefined,
				filter.search ? like(products.productName, `%${filter.search.replaceAll(' ', '%')}%`) : undefined,
			),
		)

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
			if (!cachedPattern) throw Error(`No forbidden pattern`)
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
				} = createProductEventSchema(cachedPattern).safeParse({
					id: productEventContent.id,
					...productEventContent,
				})

				if (!success) {
					console.error(`createProducts: Failed to parse product event ${productEvent.id}: ${parseError}`)
					error(500, { message: `${parseError}` })
				}

				if (!parsedProduct) {
					console.error(`createProducts: Invalid product schema for event ${productEvent.id}`)
					throw Error('Bad product schema')
				}

				const stallId = parsedProduct.stallId?.startsWith(`${KindStalls}`)
					? parsedProduct.stallId
					: `${KindStalls}:${productEvent.pubkey}:${parsedProduct.stallId}`

				const stall = await stallExists(stallId)

				if (!stall) {
					console.error(`createProducts: Stall not found for event ${productEvent.id}`)
					throw Error('Stall not found')
				}

				const parentId = customTagValue(productEvent.tags, 'a').find((tag) => tag.startsWith(KindProducts.toString())) || null

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

				if (parsedProduct.shipping?.length) {
					const validShipping = parsedProduct.shipping.filter((s) => s.id && parseFloat(String(s.cost)))
					if (validShipping.length) {
						for (const s of validShipping) {
							try {
								const shippingCoordinates =
									s.id.split(':').length > 1 ? s.id : createShippingCoordinates(s.id, String(stallId.split(':').pop()))
								await db
									.insert(productShipping)
									.values({
										cost: s.cost!,
										shippingId: shippingCoordinates,
										productId: eventCoordinates!.coordinates!,
									})
									.returning()
							} catch (e) {
								console.error(`createProducts: Failed to insert product shipping for ${productResult[0].id}: ${e}`)
							}
						}
					}
				}

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
					console.error(`createProducts: Failed to create product ${insertProduct.id}`)
					throw Error('Failed to create product')
				}
			} catch (e) {
				console.error(`createProducts: Error processing product event ${productEvent.id}: ${e}`)
				throw Error(`${e}`)
			}
		})
		const results = await Promise.all(productPromises)
		return results
	} catch (e) {
		console.error(`createProducts: Failed to create products: ${e}`)
		error(500, { message: `Failed to create products: ${e}` })
	}
}
export const updateProduct = async (productId: string, productEvent: NostrEvent): Promise<DisplayProduct | null> => {
	try {
		return await db.transaction(async (tx) => {
			if (!cachedPattern) throw Error(`No forbidden pattern`)
			const eventCoordinates = getEventCoordinates(productEvent)
			const productEventContent = JSON.parse(productEvent.content)
			const parsedProduct = createProductEventSchema(cachedPattern).safeParse({
				id: productId,
				...productEventContent,
			})
			if (!parsedProduct.success) {
				throw new Error(`Bad product schema: ${parsedProduct.error}`)
			}

			const parsedProductData = parsedProduct.data

			const stallId = parsedProductData?.stallId?.startsWith(KindStalls.toString())
				? parsedProductData?.stallId
				: `${KindStalls}:${productEvent.pubkey}:${parsedProductData?.stallId}`

			const [updatedProduct] = await tx
				.update(products)
				.set({
					description: parsedProductData.description,
					updatedAt: new Date(),
					currency: parsedProductData.currency,
					price: parsedProductData.price?.toString(),
					extraCost: parsedProductData.shipping?.length ? parsedProductData.shipping[0].cost?.toString() : '0',
					stallId,
					productName: parsedProductData.name,
					quantity: parsedProductData.quantity ?? undefined,
				})
				.where(eq(products.id, productId))
				.returning()

			if (!updatedProduct) {
				throw new Error(`Failed to update product: ${productId}`)
			}

			const existingImages = await tx.select().from(productImages).where(eq(productImages.productId, productId))
			const newImages = parsedProductData.images?.filter((img) => !existingImages.find((eImg) => eImg.imageUrl === img)) ?? []
			const removedImages = existingImages.filter((img) => img.imageUrl && !parsedProductData.images?.includes(img.imageUrl))

			if (removedImages.length > 0) {
				await tx.delete(productImages).where(
					and(
						eq(productImages.productId, productId),
						inArray(
							productImages.imageUrl,
							removedImages.map((img) => img.imageUrl).filter((url): url is string => url !== null),
						),
					),
				)
			}

			if (newImages.length > 0) {
				const existingImagesCount = existingImages.length
				await tx.insert(productImages).values(
					newImages.map((img, index) => ({
						createdAt: new Date(),
						productId,
						auctionId: null,
						imageUrl: img,
						imageType: PRODUCT_IMAGES_TYPE.GALLERY,
						imageOrder: existingImagesCount + index,
					})),
				)
			}

			if (parsedProductData.images && parsedProductData.images.length > 0) {
				for (let i = 0; i < parsedProductData.images.length; i++) {
					const img = parsedProductData.images[i]
					await tx
						.update(productImages)
						.set({ imageOrder: i })
						.where(and(eq(productImages.productId, productId), eq(productImages.imageUrl, img)))
				}
			}

			await tx.delete(productShipping).where(eq(productShipping.productId, productId))

			if (parsedProductData.shipping && parsedProductData.shipping.length > 0) {
				// TODO With the new product shipping coordinates we can have foreign key problems if we do not set the correct 'shippingId', we should improve this.
				try {
					await tx.insert(productShipping).values(
						parsedProductData.shipping.map((shipping) => ({
							cost: shipping.cost!,
							shippingId:
								shipping.id.split(':').length > 1 ? shipping.id : createShippingCoordinates(shipping.id, String(stallId.split(':').pop())),
							productId: productId,
						})),
					)
				} catch (e) {
					console.error(e)
					await tx.insert(productShipping).values(
						parsedProductData.shipping.map((shipping) => ({
							cost: shipping.cost!,
							shippingId: shipping.id,
							productId: productId,
						})),
					)
				}
			}
			await tx.delete(eventTags).where(eq(eventTags.eventId, eventCoordinates?.coordinates as string))

			if (productEvent.tags.length > 0) {
				await tx
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
					.onConflictDoNothing({ target: [eventTags.tagName, eventTags.tagValue, eventTags.eventId] })
			}

			return toDisplayProduct(updatedProduct)
		})
	} catch (e) {
		error(500, { message: `${e}` })
	}
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
