import { db, eq, orders, products, sql, stalls, users } from '@plebeian/database'
import { error } from '@sveltejs/kit'
import { takeUniqueOrThrow } from '$lib/utils'
import { format } from 'date-fns'

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

export const getAllStalls = (): RichStall[] => {
	const stallsResult = db.select().from(stalls).all()

	const richStalls: RichStall[] = stallsResult.map((stall) => {
		const ownerRes = db
			.select({ userId: users.id, userName: users.name })
			.from(users)
			.where(eq(users.id, stall.userId))
			.all()

		const productCount = db
			.select({
				count: sql<number>`cast(count(${stalls.id}) as int)`
			})
			.from(products)
			.where(eq(products.stallId, stall.id))
			.all()
			.map((product) => product.count)

		const orderCount = db
			.select({
				count: sql<number>`cast(count(${orders.id}) as int)`
			})
			.from(orders)
			.where(eq(orders.stallId, stall.id))
			.all()
			.map((order) => order.count)

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
			orderCount: takeUniqueOrThrow(orderCount)
		}
	})

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
	products: {
		id: string
		name: string
		description: string
		currency: string
		stockQty: number
	}[]
}

export const getStallById = (id: string): StallInfo => {
	const stall = db.select().from(stalls).where(eq(stalls.id, id)).all()
	const uniqueStall = takeUniqueOrThrow(stall)

	const ownerRes = db
		.select({
			userId: users.id
		})
		.from(users)
		.where(eq(users.id, uniqueStall.userId))
		.all()

	const { userId } = takeUniqueOrThrow(ownerRes)
	if (!userId) {
		error(404, 'Not found')
	}
	const stallProducts = db.select().from(products).where(eq(products.stallId, id)).all()

	const stallInfo = {
		id: uniqueStall.id,
		name: uniqueStall.name,
		description: uniqueStall.description,
		currency: uniqueStall.currency,
		createDate: format(uniqueStall.createdAt, 'dd-MM-yyyy'),
		userId: userId,
		products: stallProducts.map((product) => ({
			id: product.id,
			name: product.productName,
			description: product.description,
			currency: product.currency,
			stockQty: product.stockQty
		}))
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

export const getStallsByUserId = (userId: string): RichStall[] => {
	const stallsResult = db.select().from(stalls).where(eq(stalls.userId, userId)).all()

	const richStalls: RichStall[] = stallsResult.map((stall) => {
		const ownerRes = db
			.select({ userId: users.id, userName: users.name })
			.from(users)
			.where(eq(users.id, stall.userId))
			.all()

		const productCount = db
			.select({
				count: sql<number>`cast(count(${stalls.id}) as int)`
			})
			.from(products)
			.where(eq(products.stallId, stall.id))
			.all()
			.map((product) => product.count)

		const orderCount = db
			.select({
				count: sql<number>`cast(count(${orders.id}) as int)`
			})
			.from(orders)
			.where(eq(orders.stallId, stall.id))
			.all()
			.map((order) => order.count)

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
			orderCount: takeUniqueOrThrow(orderCount)
		}
	})

	if (richStalls) {
		return richStalls
	}

	error(404, 'Not found')
}
