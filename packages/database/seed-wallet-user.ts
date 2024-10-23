import { faker } from '@faker-js/faker'
import { sql } from 'drizzle-orm'

import { KindProducts, KindStalls } from '../app/src/lib/constants'
import { PAYMENT_DETAILS_METHOD, PRODUCT_TYPES, USER_META, V4V_DEFAULT_RECIPIENTS } from './constants'
import { db } from './database'
import { Event, PaymentDetail, Product, ProductImage, Shipping, ShippingZone, Stall, User, UserMeta } from './types'
import { createId, createShippingCoordinates } from './utils'

const randomLengthArrayFromTo = (min: number, max: number) => {
	return Array.from({ length: faker.number.int({ min, max }) })
}

const WALLETED_USER_NPUB = 'npub1u2d97q0eeppas8t2t9lvqdxj7ltgv3pgp3wqe5w5w2e78yv3tk6q30rtnr'
const WALLETED_USER_HEX = 'e29a5f01f9c843d81d6a597ec034d2f7d68644280c5c0cd1d472b3e391915db4'
const WALLETED_USER_LUD16 = 'plebeianuser@coinos.io'

const main = async () => {
	const testUser = {
		id: 'e29a5f01f9c843d81d6a597ec034d2f7d68644280c5c0cd1d472b3e391915db4',
		createdAt: faker.date.recent(),
		updatedAt: faker.date.future(),
	} as User

	const userMeta = [V4V_DEFAULT_RECIPIENTS[1], V4V_DEFAULT_RECIPIENTS[2]].map((value) => {
		let valueBoolean: boolean | null = null
		let valueNumeric: number | null = null

		valueNumeric = parseFloat(
			faker.finance.amount({
				min: 0.01,
				max: 0.05,
			}),
		)
		const userMeta = {
			id: createId(),
			userId: testUser.id,
			metaName: USER_META.V4V_SHARE.value,
			valueText: value.paymentDetails,
			valueBoolean: valueBoolean,
			valueNumeric: String(valueNumeric),
			key: value.npub,
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
		} as UserMeta

		return userMeta
	})

	const itentifier1 = createId()
	const itentifier2 = createId()

	const userStalls = [
		{
			id: `${KindStalls}:${testUser.id}:${itentifier1}`,
			userId: testUser.id,
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
			name: faker.commerce.productMaterial(),
			description: faker.commerce.productDescription(),
			identifier: itentifier1,
			currency: 'USD',
		} as Stall,
		{
			id: `${KindStalls}:${testUser.id}:${itentifier2}`,
			userId: testUser.id,
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
			name: faker.commerce.productMaterial(),
			description: faker.commerce.productDescription(),
			identifier: itentifier2,
			currency: 'BTC',
		} as Stall,
	]

	const productData = userStalls.map((stallsByUser) => {
		return randomLengthArrayFromTo(3, 12).map((_, i) => {
			const identifier = createId()
			return {
				id: `${KindProducts}:${stallsByUser.userId}:${identifier}`,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				identifier: identifier,
				stallId: stallsByUser.id,
				userId: stallsByUser.userId,
				productName: `plebeian number ${i} - ${stallsByUser.currency}`,
				description: `DESCRIPTION: plebeian number ${i} - ${stallsByUser.name}`,
				price:
					stallsByUser.currency === 'BTC'
						? faker.finance.amount({ min: 0.000001, max: 0.0000015, dec: 8 })
						: faker.finance.amount({ min: 0.05, max: 0.1 }),
				productType: PRODUCT_TYPES.SIMPLE,
				currency: stallsByUser.currency,
				isFeatured: i % 2 === 0,
				isDigital: faker.datatype.boolean({ probability: 0.8 }),
				parentId: null,
				extraCost:
					stallsByUser.currency === 'BTC'
						? faker.finance.amount({ min: 0.000001, max: 0.0000015, dec: 8 })
						: faker.finance.amount({ min: 0.05, max: 0.1 }),
				quantity: faker.number.int({ min: 0, max: 100 }),
			} as Product
		})
	})

	const paymentDetailsData = userStalls.map((stallsByUser) => {
		return {
			id: createId(),
			userId: stallsByUser.userId,
			stallId: stallsByUser.id,
			paymentMethod: PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK,
			paymentDetails: WALLETED_USER_LUD16,
		} as PaymentDetail
	})

	const shippingData = userStalls.flatMap((stallsByUser) => {
		const shippingMethods = randomLengthArrayFromTo(1, 3).map(() => {
			return {
				id: createShippingCoordinates(createId(), stallsByUser.identifier),
				stallId: stallsByUser.id,
				userId: stallsByUser.userId,
				name: 'Horse cart',
				cost:
					stallsByUser.currency === 'BTC'
						? faker.finance.amount({ min: 0.0000001, max: 0.00000015, dec: 8 })
						: faker.finance.amount({ min: 0.01, max: 0.02 }),
				isDefault: faker.datatype.boolean(),
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
			} as Shipping
		})
		return shippingMethods
	})

	const shippingZonesData = shippingData.flatMap((shippingMethods) => {
		const uniqueCombinations = new Set()

		return randomLengthArrayFromTo(2, 4).map(() => {
			let regionCode, countryCode

			do {
				regionCode = faker.location.countryCode()
				countryCode = faker.location.countryCode()
			} while (uniqueCombinations.has(`${regionCode}-${countryCode}`))

			uniqueCombinations.add(`${regionCode}-${countryCode}`)

			return {
				id: createId(),
				shippingId: shippingMethods.id,
				shippingUserId: shippingMethods.userId,
				stallId: shippingMethods.stallId,
				regionCode,
				countryCode,
			} as ShippingZone
		})
	})

	const uniqueShippingZonesData = Array.from(
		new Map(shippingZonesData.flat().map((zone) => [`${zone.shippingId}-${zone.regionCode}-${zone.countryCode}`, zone])).values(),
	)

	const productImagesData = productData.flat(2).map((product) => {
		const images = randomLengthArrayFromTo(0, 4).map((_, index) => {
			return {
				productId: product.id,
				auctionId: null,
				imageUrl: faker.image.urlLoremFlickr({
					category: 'product',
				}),
				imageType: 'gallery',
				imageOrder: index,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
			} as ProductImage
		})
		return images
	})

	const userStallsEvents = userStalls.map(
		(stall) =>
			({
				id: stall.id,
				createdAt: stall.createdAt,
				updatedAt: stall.updatedAt,
				author: stall.userId,
				kind: KindStalls,
				event: faker.string.uuid(),
			}) as Event,
	)

	const userProductsEvents = productData.map((productsByStall) =>
		productsByStall.map(
			(product) =>
				({
					id: product.id,
					createdAt: product.createdAt,
					updatedAt: product.updatedAt,
					author: product.userId,
					kind: KindProducts,
					event: product.id,
				}) as Event,
		),
	)

	const eventData = [...userStallsEvents, ...userProductsEvents] as Event[]

	const dbSchema = db._.fullSchema

	console.log('Seed test user start')
	await db.transaction(async (tx) => {
		for (const { table, data } of [
			{ table: dbSchema.users, data: testUser },
			{ table: dbSchema.userMeta, data: userMeta },
			{ table: dbSchema.stalls, data: userStalls.flat(1) },
			{ table: dbSchema.products, data: productData.flat(2) },
			{ table: dbSchema.productImages, data: productImagesData.flat(1) },
			{ table: dbSchema.paymentDetails, data: paymentDetailsData.flat(1) },
			{ table: dbSchema.shipping, data: shippingData.flat(1) },
			{ table: dbSchema.shippingZones, data: uniqueShippingZonesData },
		]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed test user done')
}

await main()
