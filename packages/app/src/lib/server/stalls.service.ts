import type { DisplayProduct } from '$lib/server/products.service'
import { error } from '@sveltejs/kit'
import { getProductsByStallId } from '$lib/server/products.service'
import { takeUniqueOrThrow } from '$lib/utils'
import { format } from 'date-fns'

import { db, eq, orders, products, sql, stalls, users } from '@plebeian/database'

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
}

export const getAllStalls = async (): Promise<RichStall[]> => {
	const stallsResult = await db.select().from(stalls).execute()

	const richStalls: RichStall[] = await Promise.all(
		stallsResult.map(async (stall) => {
			const ownerRes = await db.select({ userId: users.id, userName: users.name }).from(users).where(eq(users.id, stall.userId)).execute()

			const productCount = (
				await db
					.select({
						count: sql<number>`cast(count(${stalls.id}) as int)`,
					})
					.from(products)
					.where(eq(products.stallId, stall.id))
					.execute()
			).map((product) => product.count)

			const orderCount = (
				await db
					.select({
						count: sql<number>`cast(count(${orders.id}) as int)`,
					})
					.from(orders)
					.where(eq(orders.stallId, stall.id))
					.execute()
			).map((order) => order.count)

			const { userId, userName } = takeUniqueOrThrow(ownerRes)

			if (!userId) {
				error(404, 'Not found')
			}

			return {
				id: stall.id,
				name: stall.name,
				description: stall.description,
				currency: stall.currency,
				createDate: format(stall.createdAt, 'dd-MM-yyyy'),
				userId,
				userName,
				productCount: takeUniqueOrThrow(productCount),
				orderCount: takeUniqueOrThrow(orderCount),
			}
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
	const stall = await db.select().from(stalls).where(eq(stalls.id, id)).execute()
	const uniqueStall = takeUniqueOrThrow(stall)

	const ownerRes = await db
		.select({
			userId: users.id,
		})
		.from(users)
		.where(eq(users.id, uniqueStall.userId))
		.execute()

	const { userId } = takeUniqueOrThrow(ownerRes)
	if (!userId) {
		error(404, 'Not found')
	}
	const stallProducts = await getProductsByStallId(uniqueStall.id)

	const stallInfo = {
		id: uniqueStall.id,
		name: uniqueStall.name,
		description: uniqueStall.description,
		currency: uniqueStall.currency,
		createDate: format(uniqueStall.createdAt, 'dd-MM-yyyy'),
		userId: userId,
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

	const richStalls: RichStall[] = await Promise.all(
		stallsResult.map(async (stall) => {
			const ownerRes = await db.select({ userId: users.id, userName: users.name }).from(users).where(eq(users.id, stall.userId)).execute()

			const productCount = (
				await db
					.select({
						count: sql<number>`cast(count(${stalls.id}) as int)`,
					})
					.from(products)
					.where(eq(products.stallId, stall.id))
					.execute()
			).map((product) => product.count)

			const orderCount = (
				await db
					.select({
						count: sql<number>`cast(count(${orders.id}) as int)`,
					})
					.from(orders)
					.where(eq(orders.stallId, stall.id))
					.execute()
			).map((order) => order.count)

			const { userId, userName } = takeUniqueOrThrow(ownerRes)

			if (!userId) {
				error(404, 'Not found')
			}

			return {
				id: stall.id,
				name: stall.name,
				description: stall.description,
				currency: stall.currency,
				createDate: format(stall.createdAt, 'dd-MM-yyyy'),
				userId,
				userName,
				productCount: takeUniqueOrThrow(productCount),
				orderCount: takeUniqueOrThrow(orderCount),
			}
		}),
	)

	if (richStalls) {
		return richStalls
	}

	error(404, 'Not found')
}
