import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { StallsFilter } from '$lib/schema'
import type { DisplayProduct } from '$lib/server/products.service'
import { error } from '@sveltejs/kit'
import { standardDisplayDateFormat } from '$lib/constants'
import { stallsFilterSchema } from '$lib/schema'
import { getProductsByStallId } from '$lib/server/products.service'
import { getEventCoordinates } from '$lib/utils'
import { format } from 'date-fns'

import type { PaymentDetail, Shipping, Stall } from '@plebeian/database'
import {
	and,
	categories,
	db,
	eq,
	getTableColumns,
	inArray,
	orders,
	paymentDetails,
	productCategories,
	products,
	shipping,
	shippingZones,
	sql,
	stalls,
	users,
} from '@plebeian/database'

import type { RichShippingInfo } from './shipping.service'
import { stallEventSchema } from '../../schema/nostr-events'
import { getShippingByStallId } from './shipping.service'

export type RichStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
	userNip05: string | null
	userName: string | null
	productCount?: number
	// orderCount?: number
	paymentMethods?: PaymentDetail[]
	identifier: string
	shipping: Partial<RichShippingInfo>[]
}

export type DisplayStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	userId: string
	shipping: Partial<RichShippingInfo>[]
}

const createZone = (country: string | null, region: string | null, shippingResult: Shipping) => ({
	countryCode: country,
	regionCode: region,
	shippingId: shippingResult?.id as string,
	shippingUserId: shippingResult.userId,
	stallId: shippingResult.stallId,
})

const getZonesToInsert = (shippingResult: Shipping, regions?: string[], countries?: string[]) => {
	if (regions?.length && countries?.length) {
		return regions.flatMap((region: string) => (countries ?? []).map((country: string) => createZone(country, region, shippingResult)))
	} else if (regions?.length) {
		return regions.map((region: string) => createZone(null, region, shippingResult))
	} else if (countries?.length) {
		const z = (countries ?? []).map((country: string) => createZone(country, null, shippingResult))
		return z
	} else {
		return []
	}
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

	// const [orderCount] = (
	// 	await db
	// 		.select({
	// 			count: sql<number>`cast(count(${orders.id}) as int)`,
	// 		})
	// 		.from(orders)
	// 		.where(eq(orders.stallId, stall.id))
	// 		.execute()
	// ).map((order) => order.count)

	if (!ownerRes.userId) {
		error(404, 'Not found')
	}

	const shippingInfo = await getShippingByStallId(stall.id)

	if (!shippingInfo) {
		error(404, 'not found')
	}

	const paymentMethods = await db.select().from(paymentDetails).where(eq(paymentDetails.stallId, stall.id)).execute()

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
		// orderCount,
		paymentMethods,
		identifier: stall.id.split(':')[2],
		shipping: shippingInfo,
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
		.where(and(filter.userId ? eq(stalls.userId, filter.userId) : undefined, filter.stallId ? eq(stalls.id, filter.stallId) : undefined))
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

export type StallInfo = {
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
	if (!uniqueStall) {
		error(404, 'Stall not found')
	}
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
	.leftJoin(categories, eq(productCategories.category, categories.name))
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

export const createStall = async (stallEvent: NostrEvent): Promise<DisplayStall | undefined> => {
	try {
		const { coordinates, tagD } = getEventCoordinates(stallEvent)
		const stallEventContent = JSON.parse(stallEvent.content)
		if (!stallEventContent) {
			throw Error(`Error parsing stall event content`)
		}

		const { data, error: zodError } = stallEventSchema.safeParse({
			id: stallEventContent.id,
			...stallEventContent,
		})

		if (zodError) {
			throw Error(`Invalid stall event data: ${zodError}`)
		}

		const insertStall: Stall = {
			id: coordinates,
			createdAt: new Date(stallEvent.created_at * 1000),
			updatedAt: new Date(stallEvent.created_at * 1000),
			name: data.name,
			identifier: tagD,
			description: data.description as string,
			currency: data.currency,
			userId: stallEvent.pubkey,
		}

		const promises: Promise<unknown>[] = []

		promises.push(
			db
				.insert(stalls)
				.values(insertStall)
				.returning()
				.then(([stallResult]) => {
					if (!stallResult) {
						throw Error('Error when inserting stall')
					}
					return stallResult
				}),
		)

		for (const method of data.shipping) {
			if (!method) {
				continue
			}
			promises.push(
				db
					.insert(shipping)
					.values({
						id: method?.id as string,
						name: method?.name as string,
						cost: String(method?.cost),
						userId: insertStall.userId,
						stallId: insertStall.id,
					})
					.onConflictDoNothing({ target: [shipping.id, shipping.userId] })
					.returning()
					.then(([shippingResult]) => {
						if (!shippingResult) return

						const zonesToInsert = getZonesToInsert(shippingResult, method.regions, method.countries)
						if (zonesToInsert.length > 0) {
							return db.insert(shippingZones).values(zonesToInsert)
						}
					}),
			)
		}

		const results = await Promise.all(promises)

		const stallResult = results[0] as Stall

		return {
			id: stallResult.id,
			name: stallResult.name,
			description: stallResult.description,
			currency: stallResult.currency,
			createDate: format(stallResult.createdAt, standardDisplayDateFormat),
			userId: stallResult.userId,
			shipping: data.shipping,
		}
	} catch (e) {
		error(500, `Failed to create stall ${e}`)
	}
}

export const updateStall = async (stallId: string, stallEvent: NostrEvent): Promise<DisplayStall | null> => {
	try {
		const stallEventContent = JSON.parse(stallEvent.content)
		const { data: parsedStall, success, error: parseError } = stallEventSchema.partial().safeParse({ id: stallId, ...stallEventContent })
		if (!success) {
			throw new Error(`Failed to parse stall event: ${parseError}`)
		}

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

		if (!stallResult) {
			throw new Error(`Stall not updated: ${stallId}`)
		}

		if (parsedStall.shipping && parsedStall.shipping.length > 0) {
			try {
				await db.transaction(async (tx) => {
					const existingShippingMethods = await tx.query.shipping.findMany({
						where: and(eq(shipping.stallId, stallId), eq(shipping.userId, stallResult.userId)),
					})

					const newShippingMethodsMap = new Map(parsedStall.shipping?.map((method) => [method.id, method]))
					const existingShippingMethodsMap = new Map(existingShippingMethods.map((method) => [method.id, method]))

					const methodsToInsert = parsedStall.shipping?.filter((method) => !existingShippingMethodsMap.has(method.id)) ?? []
					const methodsToUpdate = parsedStall.shipping?.filter((method) => existingShippingMethodsMap.has(method.id)) ?? []
					const methodsToDelete = existingShippingMethods.filter((method) => !newShippingMethodsMap.has(method.id))

					if (methodsToInsert.length > 0) {
						await tx
							.insert(shipping)
							.values(
								methodsToInsert.map((method) => ({
									id: method.id,
									stallId: stallId,
									userId: stallResult.userId,
									name: method.name,
									cost: String(method.cost),
								})),
							)
							.returning()
					}

					if (methodsToUpdate.length > 0) {
						const updatePromises = methodsToUpdate.map((method) =>
							tx
								.update(shipping)
								.set({
									name: method.name,
									cost: method.cost,
									updatedAt: new Date(),
								})
								.where(and(eq(shipping.id, method.id), eq(shipping.stallId, stallId), eq(shipping.userId, stallResult.userId))),
						)
						await Promise.all(updatePromises)
					}

					if (methodsToDelete.length > 0) {
						await tx.delete(shipping).where(
							and(
								inArray(
									shipping.id,
									methodsToDelete.map((method) => method.id),
								),
								eq(shipping.stallId, stallId),
								eq(shipping.userId, stallResult.userId),
							),
						)
					}

					// Handle shipping zones
					const shippingMethodIds = parsedStall.shipping?.map((method) => method.id) ?? []

					// Delete existing zones only for the shipping methods we're updating
					await tx
						.delete(shippingZones)
						.where(and(eq(shippingZones.stallId, stallId), inArray(shippingZones.shippingId, shippingMethodIds)))

					// Insert new zones
					const zonesToInsert =
						parsedStall.shipping?.flatMap((method) => [
							...(method.regions ?? []).map((region) => ({
								shippingId: method.id,
								shippingUserId: stallResult.userId,
								stallId: stallId,
								regionCode: region,
							})),
							...(method.countries ?? []).map((country) => ({
								shippingId: method.id,
								shippingUserId: stallResult.userId,
								stallId: stallId,
								countryCode: country,
							})),
						]) ?? []

					if (zonesToInsert.length > 0) {
						await tx.insert(shippingZones).values(zonesToInsert)
					}

					console.log('Shipping method sync completed')
				})
			} catch (e) {
				error(500, { message: `Error updating stall: ${e}` })
			}
		}
		return {
			id: stallResult.id,
			name: stallResult.name,
			description: stallResult.description,
			currency: stallResult.currency,
			createDate: format(stallResult.createdAt, standardDisplayDateFormat),
			userId: stallResult.userId,
			shipping: parsedStall.shipping ?? [],
		} as DisplayStall
	} catch (e) {
		console.error(e)
		return null
	}
}
export const deleteStall = async (stallId: string, userId: string): Promise<string> => {
	const stallResult = await db.query.stalls.findFirst({
		where: and(eq(stalls.id, stallId), eq(stalls.userId, userId)),
	})

	if (!stallResult) {
		error(404, 'Not found')
	}

	if (stallResult.userId !== userId) {
		error(401, 'Unauthorized')
	}

	const deleteSuccess = await db.delete(stalls).where(eq(stalls.id, stallId)).returning()

	if (deleteSuccess) {
		return stallId
	}

	error(500, 'Failed to delete stall')
}

export const stallExists = async (stallId: string): Promise<boolean> => {
	const result = await db
		.select({ id: sql`1` })
		.from(stalls)
		.where(eq(stalls.id, stallId))
		.limit(1)
	return result.length > 0
}
