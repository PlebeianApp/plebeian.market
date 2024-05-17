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
import { db, eq, orders, products, sql, stalls, users } from '@plebeian/database'

import { stallEventSchema } from '../../schema/nostr-events'

export type RichStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
	userName: string | null
	productCount: number
	orderCount: number
	identifier: string
}

const resolveStalls = async (stall: Stall): Promise<RichStall> => {
	const [ownerRes] = await db
		.select({
			userId: users.id,
			userName: users.name,
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

	const stallsResult = await db.query.stalls
		.findMany({
			limit: filter.pageSize,
			offset: (filter.page - 1) * filter.pageSize,
			orderBy: (stalls, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
		})
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

export type DisplayStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
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
	const parsedProduct = stallEventSchema.parse({ id: productEventContent.id, ...productEventContent })

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

type StallResult = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
}

export const updateStall = async (stallId: string, stallEvent: NostrEvent): Promise<StallResult> => {
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
