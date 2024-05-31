import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { StallsFilter } from '$lib/schema'
import type { DisplayProduct } from '$lib/server/products.service'
import { error } from '@sveltejs/kit'
import { standardDisplayDateFormat } from '$lib/constants'
import { stallsFilterSchema } from '$lib/schema'
import { getProductsByStallId } from '$lib/server/products.service'
import { getEventCoordinates } from '$lib/utils'
import { format } from 'date-fns'

import type { Stall } from '@plebeian/database'
import {
	and,
	categories,
	db,
	eq,
	getTableColumns,
	orders,
	productCategories,
	products,
	shipping,
	shippingZones,
	sql,
	stalls,
	users,
} from '@plebeian/database'

import { stallEventSchema } from '../../schema/nostr-events'

export type RichStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
	userNip05: string | null
	userName: string | null
	productCount: number
	orderCount: number
	identifier: string
}

export type DisplayStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
}

const resolveStalls = async (stall: Stall): Promise<RichStall> => {
	const [ownerRes] = await db
		.select({
			userId: users.id,
			userName: users.name,
			userNip05: users.nip05,
		})
		.from(users)
		.where(eq(users.id, stall.userId))
		.execute()

	const [productCount] = (
		await db
			.select({
				count: sql<number>`cast(count(${stalls.id}) as int)`,
			})
			.from(products)
			.where(eq(products.stallId, stall.id))
			.execute()
	).map((product) => product.count)

	const [orderCount] = (
		await db
			.select({
				count: sql<number>`cast(count(${orders.id}) as int)`,
			})
			.from(orders)
			.where(eq(orders.stallId, stall.id))
			.execute()
	).map((order) => order.count)

	if (!ownerRes.userId) {
		error(404, 'Not found')
	}

	return {
		id: stall.id,
		name: stall.name,
		description: stall.description,
		currency: stall.currency,
		createDate: format(stall.createdAt, standardDisplayDateFormat),
		userId: ownerRes.userId,
		userName: ownerRes.userName,
		userNip05: ownerRes.userNip05,
		productCount,
		orderCount,
		identifier: stall.id.split(':')[2],
	}
}

export const getAllStalls = async (filter: StallsFilter = stallsFilterSchema.parse({})): Promise<RichStall[]> => {
	const orderBy = {
		createdAt: products.createdAt,
		price: products.price,
	}[filter.orderBy]

	const stallsResult = await db
		.select()
		.from(stalls)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)
		// .orderBy(filter.order === "asc" ? asc(orderBy) : desc(orderBy))
		.where(and(filter.userId ? eq(stalls.userId, filter.userId) : undefined))
		.execute()

	const richStalls = await Promise.all(
		stallsResult.map(async (stall) => {
			return await resolveStalls(stall)
		}),
	)

	if (richStalls) {
		return richStalls
	}

	error(404, 'Not found')
}

type StallInfo = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
	products: DisplayProduct[]
}

export const getStallById = async (id: string): Promise<StallInfo> => {
	const [uniqueStall] = await db.select().from(stalls).where(eq(stalls.id, id)).execute()

	const [ownerRes] = await db
		.select({
			userId: users.id,
		})
		.from(users)
		.where(eq(users.id, uniqueStall.userId))
		.execute()

	if (!ownerRes.userId) {
		error(404, 'Not found')
	}
	const stallProducts = await getProductsByStallId(uniqueStall.id)

	const stallInfo = {
		id: uniqueStall.id,
		name: uniqueStall.name,
		description: uniqueStall.description,
		currency: uniqueStall.currency,
		createDate: format(uniqueStall.createdAt, standardDisplayDateFormat),
		userId: ownerRes.userId,
		products: stallProducts,
	}

	if (stallInfo) {
		return stallInfo
	}

	error(404, 'Not found')
}

const stallsByCatNamePrepared = db
	.select({ ...getTableColumns(stalls) })
	.from(stalls)
	.leftJoin(products, eq(stalls.id, products.stallId))
	.leftJoin(productCategories, eq(products.id, productCategories.productId))
	.leftJoin(categories, eq(productCategories.catId, categories.id))
	.where(eq(categories.name, sql.placeholder('catName')))
	.groupBy(stalls.id)
	.prepare()

export const getStallsByCatName = async (catName: string): Promise<RichStall[]> => {
	const stallsRes = await stallsByCatNamePrepared.execute({ catName: catName })
	const richStalls = await Promise.all(
		stallsRes.map(async (stall) => {
			return await resolveStalls(stall)
		}),
	)

	if (richStalls) {
		return richStalls
	}

	throw new Error('404: Not found')
}

export const getStallsByUserId = async (userId: string): Promise<RichStall[]> => {
	const stallsResult = await db.select().from(stalls).where(eq(stalls.userId, userId)).execute()

	const richStalls = await Promise.all(
		stallsResult.map(async (stall) => {
			return await resolveStalls(stall)
		}),
	)

	if (richStalls) {
		return richStalls
	}

	error(404, 'Not found')
}

export const createStall = async (stallEvent: NostrEvent): Promise<DisplayStall> => {
	const eventCoordinates = getEventCoordinates(stallEvent)
	const productEventContent = JSON.parse(stallEvent.content)
	const parsedProduct = stallEventSchema.parse({
		id: productEventContent.id,
		...productEventContent,
	})

	const insertStall: Stall = {
		id: eventCoordinates.coordinates,
		createdAt: new Date(stallEvent.created_at! * 1000),
		updatedAt: new Date(stallEvent.created_at! * 1000),
		name: parsedProduct.name,
		identifier: eventCoordinates.tagD,
		description: parsedProduct.description as string,
		currency: parsedProduct.currency,
		userId: stallEvent.pubkey,
	}
	const [stallResult] = await db.insert(stalls).values(insertStall).returning()
	if (!stallResult) {
		error(404, 'Not found')
	}

	for (const method of parsedProduct.shipping) {
		const [shippingResult] = await db
			.insert(shipping)
			.values({
				id: method.id,
				name: method.name,
				baseCost: String(method.baseCost),
				userId: stallResult.userId,
				stallId: stallResult.id,
			})
			.returning()

		await db.insert(shippingZones).values(
			method.regions.map((region) => ({
				countryCode: region,
				regionCode: region,
				shippingId: shippingResult.id,
				stallId: stallResult.id,
			})),
		)
	}

	const stall = stallResult

	return {
		id: stall.id,
		name: stall.name,
		description: stall.description,
		currency: stall.currency,
		createDate: format(stall.createdAt, standardDisplayDateFormat),
		userId: stall.userId,
	}
}

export const updateStall = async (stallId: string, stallEvent: NostrEvent): Promise<DisplayStall> => {
	const stallEventContent = JSON.parse(stallEvent.content)
	const parsedStall = stallEventSchema.partial().parse({ id: stallId, ...stallEventContent })
	const insertStall: Partial<Stall> = {
		updatedAt: new Date(),
		name: parsedStall.name,
		description: parsedStall.description,
		currency: parsedStall.currency,
	}

	const [stallResult] = await db
		.update(stalls)
		.set({
			...insertStall,
		})
		.where(eq(stalls.id, stallId))
		.returning()

	if (stallResult) {
		await db.delete(shippingZones).where(eq(shippingZones.stallId, stallId)).execute()

		for (const method of parsedStall.shipping ?? []) {
			const [shippingResult] = await db
				.insert(shipping)
				.values({
					id: method.id,
					name: method.name,
					baseCost: String(method.baseCost),
					userId: stallResult.userId,
					stallId: stallResult.id,
				})
				.returning()

			await db.insert(shippingZones).values(
				method.regions.map((region) => ({
					countryCode: region,
					regionCode: region,
					shippingId: shippingResult.id,
					stallId: stallResult.id,
				})),
			)
		}
		return {
			id: stallResult.id,
			name: stallResult.name,
			description: stallResult.description,
			currency: stallResult.currency,
			createDate: format(stallResult.createdAt, standardDisplayDateFormat),
			userId: stallResult.userId,
		}
	}

	error(500, 'Failed to update product')
}
