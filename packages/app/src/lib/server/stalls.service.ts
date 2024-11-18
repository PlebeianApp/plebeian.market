import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { EventCoordinates, ExistsResult } from '$lib/interfaces'
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
	stallMeta,
	stalls,
	users,
} from '@plebeian/database'

import type { RichShippingInfo } from './shipping.service'
import { createStallEventContentSchema } from '../../schema/nostr-events'
import { cachedPattern } from './appSettings.service'
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
	isFeatured: boolean
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

const getZonesToInsert = (shippingResult: Shipping, regions: string[] | null, countries: string[] | null) => {
	if (regions === null || countries === null) {
		return [createZone(countries === null ? null : null, regions === null ? null : null, shippingResult)]
	}

	const hasRegions = regions.length > 0
	const hasCountries = countries.length > 0

	if (!hasRegions && !hasCountries) return []

	if (hasRegions && !hasCountries) {
		return regions.map((region) => createZone(null, region, shippingResult))
	}
	if (!hasRegions && hasCountries) {
		return countries.map((country) => createZone(country, null, shippingResult))
	}

	return regions.flatMap((region) => countries.map((country) => createZone(country, region, shippingResult)))
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

	const [featuredMeta] = await db
		.select()
		.from(stallMeta)
		.where(and(eq(stallMeta.stallId, stall.id), eq(stallMeta.metaName, 'is_global_featured')))
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
		paymentMethods,
		image: image?.tagValue ?? undefined,
		identifier: parseCoordinatesString(stall.id).tagD!,
		shipping: shippingInfo,
		geohash: geo?.tagValue ?? undefined,
		isFeatured: featuredMeta?.valueBoolean ?? false,
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
				eq(stalls.banned, false),
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
				eq(stalls.banned, false),
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
	const [uniqueStall] = await db
		.select()
		.from(stalls)
		.where(and(eq(stalls.id, id), eq(stalls.banned, false)))
		.execute()
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
	.where(and(eq(eventTags.tagValue, sql.placeholder('catName')), eq(eventTags.tagName, 't'), eq(stalls.banned, false)))
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

// export const setProductMetaFeatured = async (productId: string, featured: boolean) => {
// 	const existingMeta = await db
// 		.select()
// 		.from(productMeta)
// 		.where(and(eq(productMeta.productId, productId), eq(productMeta.metaName, 'is_global_featured')))
// 		.execute()

// 	let resultProductId

// 	if (existingMeta.length > 0) {
// 		const [updatedMeta] = await db
// 			.update(productMeta)
// 			.set({ valueBoolean: featured })
// 			.where(and(eq(productMeta.productId, productId), eq(productMeta.metaName, 'is_global_featured')))
// 			.returning()
// 		if (!updatedMeta.productId) {
// 			throw new Error('Failed to update product meta')
// 		}
// 		resultProductId = updatedMeta.productId
// 	} else {
// 		const [updatedMeta] = await db
// 			.insert(productMeta)
// 			.values({
// 				productId,
// 				metaName: 'is_global_featured',
// 				valueBoolean: featured,
// 				createdAt: new Date(),
// 				updatedAt: new Date(),
// 			})
// 			.returning()
// 		if (!updatedMeta.productId) {
// 			throw new Error('Failed to insert product meta')
// 		}
// 		resultProductId = updatedMeta.productId
// 	}

// 	if (!resultProductId) {
// 		throw new Error('Failed to update product meta')
// 	}
// }

export const setStallMetaFeatured = async (stallId: string, featured: boolean) => {
	const existingMeta = await db
		.select()
		.from(stallMeta)
		.where(and(eq(stallMeta.stallId, stallId), eq(stallMeta.metaName, 'is_global_featured')))
		.execute()

	let resultStallId

	if (existingMeta.length > 0) {
		const [updatedMeta] = await db
			.update(stallMeta)
			.set({ valueBoolean: featured })
			.where(and(eq(stallMeta.stallId, stallId), eq(stallMeta.metaName, 'is_global_featured')))
			.returning()
		if (!updatedMeta.stallId) {
			throw new Error('Failed to update stall meta')
		}
		resultStallId = updatedMeta.stallId
	} else {
		const [updatedMeta] = await db
			.insert(stallMeta)
			.values({
				stallId: stallId,
				metaName: 'is_global_featured',
				valueBoolean: featured,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()
		if (!updatedMeta.stallId) {
			throw new Error('Failed to insert stall meta')
		}
		resultStallId = updatedMeta.stallId
	}

	if (!resultStallId) {
		throw new Error('Failed to update stall meta')
	}

	return resultStallId
}

export const getStallsByUserId = async (userId: string): Promise<RichStall[]> => {
	const stallsResult = await db
		.select()
		.from(stalls)
		.where(and(eq(stalls.userId, userId), eq(stalls.banned, false)))
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

export const createStall = async (stallEvent: NostrEvent): Promise<DisplayStall | undefined> => {
	try {
		return await db.transaction(async (tx) => {
			if (!cachedPattern) throw Error(`No forbidden pattern`)
			const { coordinates, tagD } = getEventCoordinates(stallEvent) as EventCoordinates

			const { data, success } = createStallEventContentSchema(cachedPattern).safeParse({
				id: coordinates,
				...JSON.parse(stallEvent.content),
			})

			if (!success) throw Error(`Invalid stall event data`)

			const insertStall: Stall = {
				id: coordinates,
				createdAt: new Date(stallEvent.created_at * 1000),
				updatedAt: new Date(stallEvent.created_at * 1000),
				banned: false,
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
						const zonesToInsert = getZonesToInsert(shippingResult, method.regions ?? null, method.countries ?? null)
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
		return error(e.status, `Failed to create stall: ${e}`)
	}
}

export const updateStall = async (stallId: string, stallEvent: NostrEvent): Promise<DisplayStall | null> => {
	try {
		return await db.transaction(async (tx) => {
			if (!cachedPattern) throw Error(`No forbidden pattern`)
			const { data: parsedStall, success } = createStallEventContentSchema(cachedPattern)
				.partial()
				.safeParse({
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
						const zonesToInsert = getZonesToInsert(shippingResult, method.regions ?? null, method.countries ?? null)
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

export const getBannedStalls = async () => {
	const stallsResult = await db.query.stalls.findMany({
		where: eq(stalls.banned, true),
	})
	return stallsResult
}

export const setStallBanned = async (stallId: string, banned: boolean) => {
	return await db.transaction(async (tx) => {
		const stallProducts = await tx.select({ id: products.id }).from(products).where(eq(products.stallId, stallId)).execute()

		if (stallProducts.length > 0) {
			await tx
				.update(products)
				.set({ banned })
				.where(
					inArray(
						products.id,
						stallProducts.map((p) => p.id),
					),
				)
				.execute()
		}

		const [updatedStall] = await tx.update(stalls).set({ banned }).where(eq(stalls.id, stallId)).returning()

		if (!updatedStall) {
			throw new Error('Failed to update stall')
		}

		return updatedStall
	})
}

export const deleteStall = async (stallId: string): Promise<string> => {
	const stallResult = await db.query.stalls.findFirst({
		where: eq(stalls.id, stallId),
	})

	if (!stallResult) {
		error(404, 'Not found')
	}

	const deleteSuccess = await db.delete(stalls).where(eq(stalls.id, stallId)).returning()

	if (deleteSuccess) {
		return stallId
	}

	error(500, 'Failed to delete stall')
}

export const stallExists = async (stallId: string): Promise<ExistsResult> => {
	const [result] = await db.select().from(stalls).where(eq(stalls.id, stallId)).limit(1)

	if (!result) {
		return {
			exists: false,
			banned: false,
		}
	}

	return {
		exists: true,
		banned: result.banned,
	}
}
