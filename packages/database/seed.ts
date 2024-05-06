import { faker } from '@faker-js/faker'
import { sql } from 'drizzle-orm'

import {
	allowedMetaNames,
	auctionStatus,
	bidStatus,
	devUser1,
	devUser2,
	devUser3,
	devUser4,
	devUser5,
	digitalProductMetaTypes,
	generalMetaTypes,
	invoiceStatus,
	orderStatus,
	paymentDetailsMethod,
	productMetaTypes,
	productTypes,
} from './constants'
import { db } from './database'
import {
	Auction,
	Bid,
	Category,
	Event,
	Invoice,
	MetaType,
	Order,
	OrderItem,
	PaymentDetail,
	Product,
	ProductCategory,
	ProductImage,
	ProductMeta,
	Shipping,
	ShippingZone,
	Stall,
	User,
} from './types'
import { createId } from './utils'

const randomLengthArrayFromTo = (min: number, max: number) => {
	return Array.from({ length: faker.number.int({ min, max }) })
}

const randomHexValue = () => {
	return faker.string.hexadecimal({
		length: 64,
		prefix: '',
		casing: 'lower',
	})
}

const main = async () => {
	const userIds = [devUser1, devUser2, devUser3, devUser4, devUser5].map((user) => ({ id: user.pk }))

	const fullUsers = userIds.map(
		(user) =>
			({
				...user,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				name: faker.person.firstName(),
				role: 'pleb',
				displayName: faker.person.middleName(),
				about: faker.person.bio(),
				image: faker.image.avatar(),
				banner: faker.image.urlLoremFlickr({ width: 800, height: 400 }),
				nip05: faker.internet.email(),
				lud06: randomHexValue(),
				lud16: randomHexValue(),
				website: faker.internet.url(),
				zapService: faker.internet.url(),
				lastLogin: faker.date.future(),
			}) as User,
	)

	const userStalls = userIds.map((user) => {
		return randomLengthArrayFromTo(4, 8).map(() => {
			return {
				userId: user.id,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				id: randomHexValue(),
				name: faker.commerce.productMaterial(),
				description: faker.commerce.productDescription(),
				currency: faker.finance.currencyCode(),
			} as Stall
		})
	})

	const productData = userStalls.map((stallsByUser) => {
		return stallsByUser.map((stall) => {
			return randomLengthArrayFromTo(3, 12).map((_, i) => {
				return {
					id: randomHexValue(),
					createdAt: faker.date.recent(),
					updatedAt: faker.date.future(),
					stallId: stall.id,
					userId: stall.userId,
					productName: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					price: faker.finance.amount(),
					productType: productTypes[0],
					currency: faker.finance.currencyCode(),
					isFeatured: i % 2 === 0,
					isDigital: faker.datatype.boolean({ probability: 0.8 }),
					parentId: null,
					stockQty: faker.number.int({ min: 0, max: 100 }),
				} as Product
			})
		})
	})

	const paymentDetailsData = userStalls.map((stallsByUser) => {
		return stallsByUser.map((stall) => {
			return {
				id: createId(),
				userId: stall.userId,
				stallId: stall.id,
				paymentMethod: faker.helpers.arrayElement(paymentDetailsMethod),
				paymentDetails: faker.finance.creditCardNumber(),
			} as PaymentDetail
		})
	})

	const shippingData = userStalls.map((stallsByUser) => {
		return stallsByUser.map((stall) => {
			return {
				id: createId(),
				stallId: stall.id,
				userId: stall.userId,
				name: faker.commerce.productName(),
				shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
				shippingDetails: faker.commerce.productDescription(),
				baseCost: faker.finance.amount(),
				isDefault: faker.datatype.boolean(),
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
			} as Shipping
		})
	})

	const shippingZonesData = shippingData.map((shippingByStall) => {
		return shippingByStall.map((shipping) => {
			return {
				id: createId(),
				shippingId: shipping.id,
				stallId: shipping.stallId,
				regionCode: faker.location.countryCode(),
				countryCode: faker.location.countryCode(),
			} as ShippingZone
		})
	})

	const auctionsData = userStalls.map((stallByUser) => {
		return stallByUser.map((stall) => {
			return {
				id: randomHexValue(),
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				stallId: stall.id,
				userId: stall.userId,
				productName: faker.commerce.productName(),
				description: faker.commerce.productDescription(),
				productType: faker.helpers.arrayElement(productTypes),
				currency: faker.finance.currencyCode(),
				stockQty: faker.number.int(),
				parentId: null,
				startingBidAmount: faker.finance.amount(),
				startDate: faker.date.recent(),
				endDate: faker.date.future(),
				specs: faker.commerce.productMaterial() || null,
				status: faker.helpers.arrayElement(auctionStatus),
			} as Auction
		})
	})

	const bidsData = auctionsData.map((auctionByStall) => {
		return auctionByStall.map((auction) => {
			return {
				id: randomHexValue(),
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				auctionId: auction.id,
				userId: faker.helpers.arrayElement(userIds).id,
				bidAmount: faker.finance.amount(),
				bidStatus: faker.helpers.arrayElement(bidStatus),
			} as Bid
		})
	})

	const ordersData = shippingData.map((shippingByStall) => {
		return shippingByStall.map((shipping) => {
			return randomLengthArrayFromTo(3, 12).map(() => {
				return {
					id: createId(),
					createdAt: faker.date.recent(),
					updatedAt: faker.date.future(),
					sellerUserId: faker.helpers.arrayElement(userIds).id,
					buyerUserId: faker.helpers.arrayElement(userIds).id,
					status: faker.helpers.arrayElement(orderStatus),
					shippingId: shipping.id,
					stallId: shipping.stallId,
					address: faker.location.streetAddress(),
					zip: faker.location.zipCode(),
					city: faker.location.city(),
					region: faker.location.state(),
					contactName: faker.person.firstName(),
					contactPhone: faker.phone.number(),
					contactEmail: faker.internet.email(),
					observations: faker.lorem.sentence(),
				} as Order
			})
		})
	})

	const orderItemsData = ordersData.map((orders) => {
		return orders.flat(1).map((order) => {
			return {
				orderId: order.id,
				productId: faker.helpers.arrayElement(productData.flat(2)).id,
				qty: faker.number.int({ min: 1, max: 10 }),
			} as OrderItem
		})
	})

	const invoicesData = ordersData.map((orders) => {
		return orders.flat(1).map((order) => {
			return {
				id: createId(),
				orderId: order.id,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				totalAmount: faker.finance.amount(),
				invoiceStatus: faker.helpers.arrayElement(invoiceStatus),
				paymentMethod: faker.helpers.arrayElement(paymentDetailsMethod),
				paymentDetails: faker.finance.creditCardNumber(),
			} as Invoice
		})
	})

	const categoryData = [
		{
			id: createId(),
			name: faker.commerce.department(),
			description: faker.commerce.productDescription(),
			parentId: null,
		},
	] as Category[]

	const productCategoryData = productData.flat(2).map(
		(product) =>
			({
				productId: product.id,
				catId: faker.helpers.arrayElement(categoryData).id,
			}) as ProductCategory,
	)

	const metaTypeData = allowedMetaNames.map((metaName) => {
		let scope: string

		if (productMetaTypes.some((meta) => meta.name === metaName) || digitalProductMetaTypes.some((meta) => meta.name === metaName)) {
			scope = 'products'
		} else {
			scope = 'products'
		}

		const metaTypes = [...productMetaTypes, ...digitalProductMetaTypes, ...generalMetaTypes]
		const findMetaType = metaTypes.find((meta) => meta.name === metaName)
		const dataType = findMetaType?.dataType || 'text'

		const metaType = {
			name: metaName,
			description: faker.commerce.productDescription(),
			scope: scope,
			dataType: dataType,
		} as MetaType

		return metaType
	})

	const productMetaData = metaTypeData.flat(2).map((metaType) => {
		const { dataType, name } = metaType
		let valueText: string | null = null
		let valueBoolean: boolean | null = null
		let valueInteger: number | null = null
		let valueNumeric: number | null = null

		if (dataType == 'text') {
			valueText = faker.string.uuid()
		} else if (dataType == 'boolean') {
			valueBoolean = faker.datatype.boolean()
		} else if (dataType == 'integer') {
			valueInteger = faker.number.int()
		} else if (dataType == 'numeric') {
			valueNumeric = faker.number.float({ fractionDigits: 2 })
		}
		const productMeta = {
			id: createId(),
			productId: faker.helpers.arrayElement(productData.flat(2)).id,
			metaName: name,
			valueText: valueText,
			valueBoolean: valueBoolean,
			valueInteger: valueInteger,
			valueNumeric: valueNumeric,
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
		} as ProductMeta

		return productMeta
	})

	const productImagesData = productData.flat(2).map((product) => {
		// TODO: disregard thumbnails for now
		const mainImage = {
			productId: product.id,
			imageUrl: faker.image.urlLoremFlickr({
				category: 'product',
			}),
			imageType: 'main',
			imageOrder: 0,
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
		} as ProductImage
		const galleryImages = randomLengthArrayFromTo(0, 4).map((i) => {
			return {
				productId: product.id,
				imageUrl: faker.image.urlLoremFlickr({
					category: 'product',
				}),
				imageType: 'gallery',
				imageOrder: i,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
			} as ProductImage
		})
		return [mainImage, ...galleryImages]
	})

	const eventData = userIds.map(
		(user) =>
			({
				id: randomHexValue(),
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				author: user.id,
				kind: faker.number.int(),
				event: faker.string.uuid(),
			}) as Event,
	)

	db.run(sql`PRAGMA foreign_keys = OFF;`)

	console.log('Reset start')
	const dbSchema = db._.fullSchema
	await Promise.all([
		db.delete(dbSchema.categories),
		db.delete(dbSchema.stalls),
		db.delete(dbSchema.products),
		db.delete(dbSchema.productCategories),
		db.delete(dbSchema.productImages),
		db.delete(dbSchema.auctions),
		db.delete(dbSchema.metaTypes),
		db.delete(dbSchema.productMeta),
		db.delete(dbSchema.bids),
		db.delete(dbSchema.orders),
		db.delete(dbSchema.orderItems),
		db.delete(dbSchema.invoices),
		db.delete(dbSchema.shipping),
		db.delete(dbSchema.shippingZones),
		db.delete(dbSchema.paymentDetails),
		db.delete(dbSchema.events),
		db.delete(dbSchema.users),
	])
	console.log('Reset done')

	console.log('Seed start')
	await db.transaction(async (tx) => {
		for (const { table, data } of [
			{ table: dbSchema.users, data: fullUsers },
			{ table: dbSchema.stalls, data: userStalls.flat(1) },
			{ table: dbSchema.auctions, data: auctionsData.flat(2) },
			{ table: dbSchema.bids, data: bidsData.flat(2) },
			{ table: dbSchema.categories, data: categoryData },
			{ table: dbSchema.products, data: productData.flat(2) },
			{ table: dbSchema.metaTypes, data: metaTypeData.flat(1) },
			{ table: dbSchema.productMeta, data: productMetaData.flat(1) },
			{ table: dbSchema.productImages, data: productImagesData.flat(1) },
			{ table: dbSchema.productCategories, data: productCategoryData },
			{ table: dbSchema.paymentDetails, data: paymentDetailsData.flat(1) },
			{ table: dbSchema.shipping, data: shippingData.flat(1) },
			{ table: dbSchema.shippingZones, data: shippingZonesData.flat(1) },
			{ table: dbSchema.orders, data: ordersData.flat(2) },
			{ table: dbSchema.invoices, data: invoicesData.flat(1) },
			{ table: dbSchema.orderItems, data: orderItemsData.flat(1) },
			{ table: dbSchema.events, data: eventData },
		]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed done')
}

await main()
