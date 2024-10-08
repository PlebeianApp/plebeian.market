import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { EventCoordinates } from '$lib/interfaces'
import type { StallsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { stallsFilterSchema } from '$lib/schema'
import { customTagValue, getEventCoordinates, parseCoordinatesString } from '$lib/utils'
import { format } from 'date-fns'

import type { PaymentDetail, Shipping, Stall } from '@plebeian/database'
import {
	and,
	asc,
	count,
	createShippingCoordinates,
	db,
	desc,
	eq,
	eventTags,
	getTableColumns,
	inArray,
	like,
	paymentDetails,
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
	image?: string
	identifier: string
	shipping: Partial<RichShippingInfo>[]
	geohash?: string
}

export type DisplayStall = {
	id: string
	name: string
	description: string
	currency: string
	createDate: string
	image?: string
	userId: string
	shipping: Partial<RichShippingInfo>[]
}

const createZone = (country: string | null, region: string | null, shippingResult: Shipping) => ({
	countryCode: country,
	regionCode: region,
	shippingId: shippingResult?.id,
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

	const [image] = await db
		.select()
		.from(eventTags)
		.where(and(eq(eventTags.eventId, stall.id), eq(eventTags.tagName, 'image')))
		.execute()

	const [geo] = await db
		.select()
		.from(eventTags)
		.where(and(eq(eventTags.eventId, stall.id), eq(eventTags.tagName, 'g')))
		.execute()

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
		image: image?.tagValue ?? undefined,
		identifier: parseCoordinatesString(stall.id).tagD!,
		shipping: shippingInfo,
		geohash: geo?.tagValue ?? undefined,
	}
}

export const getAllStalls = async (filter: StallsFilter = stallsFilterSchema.parse({})) => {
	const orderBy = {
		createdAt: stalls.createdAt,
	}[filter.orderBy]

	const stallsResult = await db
		.select()
		.from(stalls)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)
		.orderBy(filter.order === 'asc' ? asc(orderBy) : desc(orderBy))
		.where(
			and(
				filter.userId ? eq(stalls.userId, filter.userId) : undefined,
				filter.stallId ? eq(stalls.id, filter.stallId) : undefined,
				filter.search ? like(stalls.name, `%${filter.search.replaceAll(' ', '%')}%`) : undefined,
			),
		)
		.execute()

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(stalls)
		.where(
			and(
				filter.userId ? eq(stalls.userId, filter.userId) : undefined,
				filter.stallId ? eq(stalls.id, filter.stallId) : undefined,
				filter.search ? like(stalls.name, `%${filter.search.replaceAll(' ', '%')}%`) : undefined,
			),
		)
		.execute()
	const richStalls = await Promise.all(
		stallsResult.map(async (stall) => {
			return await resolveStalls(stall)
		}),
	)

	if (richStalls) {
		return { total, stalls: richStalls }
	}

	error(404, 'Not found')
}

export const getStallById = async (id: string): Promise<RichStall> => {
	const [uniqueStall] = await db.select().from(stalls).where(eq(stalls.id, id)).execute()
	if (!uniqueStall) {
		error(404, 'Stall not found')
	}
	const richStall = await resolveStalls(uniqueStall)
	if (richStall) {
		return richStall
	}

	error(404, 'Not found')
}

const stallsByCatNamePrepared = db
	.select({ ...getTableColumns(stalls) })
	.from(stalls)
	.leftJoin(products, eq(stalls.id, products.stallId))
	.leftJoin(eventTags, eq(products.id, eventTags.eventId))
	.where(and(eq(eventTags.tagValue, sql.placeholder('catName')), eq(eventTags.tagName, 't')))
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
		return await db.transaction(async (tx) => {
			const { coordinates, tagD } = getEventCoordinates(stallEvent) as EventCoordinates

			const { data, success } = stallEventSchema.safeParse({
				id: coordinates,
				...JSON.parse(stallEvent.content),
			})

			if (!success) throw Error(`Invalid stall event data`)

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

			const [stallResult] = await tx.insert(stalls).values(insertStall).returning()
			if (!stallResult) throw Error('Error when inserting stall')

			// Insert shipping methods and zones
			if (data.shipping?.length) {
				for (const method of data.shipping) {
					const [shippingResult] = await tx
						.insert(shipping)
						.values({
							id: createShippingCoordinates(method.id, insertStall.identifier),
							name: method.name as string,
							cost: String(method.cost),
							userId: insertStall.userId,
							stallId: insertStall.id,
						})
						.returning()

					if (shippingResult) {
						const zonesToInsert = getZonesToInsert(shippingResult, method.regions, method.countries)
						if (zonesToInsert.length > 0) {
							await tx.insert(shippingZones).values(zonesToInsert)
						}
					}
				}
			}

			// Insert image and geo tags
			const tagsToInsert = [
				['image', customTagValue(stallEvent.tags, 'image')[0]],
				['g', customTagValue(stallEvent.tags, 'g')[0]],
			].filter(([, value]) => value) as [string, string][]

			if (tagsToInsert.length > 0) {
				await tx.insert(eventTags).values(
					tagsToInsert.map(([tagName, tagValue]) => ({
						userId: stallResult.userId,
						eventId: stallResult.id,
						tagName,
						tagValue,
						eventKind: KindStalls,
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
				shipping: data.shipping,
			}
		})
	} catch (e) {
		console.error(`Failed to create stall: ${e}`)
		throw error(500, `Failed to create stall: ${e}`)
	}
}

export const updateStall = async (stallId: string, stallEvent: NostrEvent): Promise<DisplayStall | null> => {
	try {
		return await db.transaction(async (tx) => {
			const { data: parsedStall, success } = stallEventSchema.partial().safeParse({
				id: stallId,
				...JSON.parse(stallEvent.content),
			})
			if (!success) throw new Error(`Failed to parse stall event`)

			const [stallResult] = await tx
				.update(stalls)
				.set({
					updatedAt: new Date(),
					name: parsedStall.name,
					description: parsedStall.description,
					currency: parsedStall.currency,
				})
				.where(eq(stalls.id, stallId))
				.returning()

			if (!stallResult) throw new Error(`Stall not updated: ${stallId}`)

			const tagUpdates = [
				['image', customTagValue(stallEvent.tags, 'image')[0]],
				['g', customTagValue(stallEvent.tags, 'g')[0]],
			].filter(([, value]) => value) as [string, string][]

			if (tagUpdates.length > 0) {
				await tx.delete(eventTags).where(
					and(
						eq(eventTags.eventId, stallId),
						inArray(
							eventTags.tagName,
							tagUpdates.map(([name]) => name),
						),
					),
				)

				await tx.insert(eventTags).values(
					tagUpdates.map(([tagName, tagValue]) => ({
						userId: stallResult.userId,
						eventId: stallId,
						tagName,
						tagValue,
						eventKind: KindStalls,
					})),
				)
			}

			if (parsedStall.shipping?.length) {
				await tx.delete(shipping).where(eq(shipping.stallId, stallId))

				for (const method of parsedStall.shipping) {
					const [shippingResult] = await tx
						.insert(shipping)
						.values({
							id: createShippingCoordinates(method.id, stallResult.identifier),
							stallId,
							userId: stallResult.userId,
							name: method.name,
							cost: String(method.cost),
						})
						.returning()

					if (shippingResult) {
						const zonesToInsert = getZonesToInsert(shippingResult, method.regions, method.countries)
						if (zonesToInsert.length > 0) {
							await tx.insert(shippingZones).values(zonesToInsert)
						}
					}
				}
			}

			const [image] = await tx
				.select()
				.from(eventTags)
				.where(and(eq(eventTags.eventId, stallId), eq(eventTags.tagName, 'image')))
				.limit(1)

			return {
				id: stallResult.id,
				name: stallResult.name,
				description: stallResult.description,
				currency: stallResult.currency,
				createDate: format(stallResult.createdAt, standardDisplayDateFormat),
				image: image?.tagValue,
				userId: stallResult.userId,
				shipping: parsedStall.shipping ?? [],
			} as DisplayStall
		})
	} catch (e) {
		console.error(`Error updating stall: ${e}`)
		return null
	}
}

export const deleteStall = async (stallId: string, userId: string): Promise<string> => {
	const stallResult = await db.query.stalls.findFirst({
		where: eq(stalls.id, stallId),
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
