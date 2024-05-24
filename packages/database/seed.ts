import { faker } from '@faker-js/faker'
import { sql } from 'drizzle-orm'

import { KindAuctionProduct, KindBids, KindProducts, KindStalls } from '../app/src/lib/constants'
import {
	CURRENCIES,
	APP_SETTINGS_META,
	AUCTION_STATUS,
	BID_STATUS,
	DIGITAL_PRODUCT_META,
	GENERAL_META,
	INVOICE_STATUS,
	META_NAMES,
	ORDER_STATUS,
	PAYMENT_DETAILS_METHOD,
	PRODUCT_META,
	PRODUCT_TYPES,
	USER_TRUST_LEVEL,
} from './constants'
import { db } from './database'
import { devInstance, devUser1, devUser2, devUser3, devUser4, devUser5 } from './fixtures'
import {
	AppSettings,
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

	const appSettings = {
		instancePk: devInstance.pk,
		instanceName: 'Dev Instance',
	} as AppSettings

	const userIds = [devUser1, devUser2, devUser3, devUser4, devUser5].map((user) => ({ id: user.pk }))

	const fullUsers = userIds.map(
		(user) =>
			({
				...user,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				name: faker.person.firstName(),
				role: user.id == devUser1.pk ? 'admin' : 'pleb',
				displayName: faker.person.middleName(),
				about: faker.person.bio(),
				image: faker.image.avatar(),
				banner: faker.image.urlLoremFlickr({ width: 800, height: 400 }),
				nip05: faker.internet.email().toLowerCase(),
				lud06: randomHexValue(),
				lud16: randomHexValue(),
				website: faker.internet.url(),
				zapService: faker.internet.url(),
				lastLogin: faker.date.future(),
				trustLevel: faker.helpers.arrayElement(Object.values(USER_TRUST_LEVEL))
			}) as User,
	)

	const userStalls = userIds.map((user) => {
		return randomLengthArrayFromTo(4, 8).map(() => {
			const identifier = createId()
			return {
				id: `${KindStalls}:${user.id}:${identifier}`,
				userId: user.id,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				name: faker.commerce.productMaterial(),
				description: faker.commerce.productDescription(),
				identifier: identifier,
				currency: faker.helpers.arrayElement(CURRENCIES),
			} as Stall
		})
	})

	const productData = userStalls.map((stallsByUser) => {
		return stallsByUser.map((stall) => {
			return randomLengthArrayFromTo(3, 12).map((_, i) => {
				const identifier = createId()
				return {
					id: `${KindProducts}:${stall.userId}:${identifier}`,
					createdAt: faker.date.recent(),
					updatedAt: faker.date.future(),
					identifier: identifier,
					stallId: stall.id,
					userId: stall.userId,
					productName: faker.commerce.productName(),
					description: faker.commerce.productDescription(),
					price: faker.finance.amount(),
					productType: PRODUCT_TYPES.SIMPLE,
					currency: faker.helpers.arrayElement(CURRENCIES),
					isFeatured: i % 2 === 0,
					isDigital: faker.datatype.boolean({ probability: 0.8 }),
					parentId: null,
					extraCost: faker.finance.amount(),
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
				paymentMethod: faker.helpers.arrayElement(Object.values(PAYMENT_DETAILS_METHOD)),
				paymentDetails: faker.finance.creditCardNumber(),
			} as PaymentDetail
		})
	})

	const shippingData = userStalls.flatMap((stallsByUser) => {
		return stallsByUser.map((stall) => {
		const shippingMethods = randomLengthArrayFromTo(1, 3).map(() => {
			return {
			id: createId(),
			stallId: stall.id,
			userId: stall.userId,
			name: faker.commerce.productName(),
			baseCost: faker.finance.amount(),
			isDefault: faker.datatype.boolean(),
			createdAt: faker.date.recent(),
			updatedAt: faker.date.future(),
			} as Shipping
		})
		return shippingMethods
		})
	})
	
	const shippingZonesData = shippingData.flatMap((shippingMethods) => {
		return shippingMethods.map((shipping) => {
		const shippingZones = randomLengthArrayFromTo(2, 4).map(() => {
			return {
			id: createId(),
			shippingId: shipping.id,
			stallId: shipping.stallId,
			regionCode: faker.location.countryCode(),
			countryCode: faker.location.countryCode(),
			} as ShippingZone
		})
		return shippingZones
		})
	})
	
	const auctionsData = userStalls.map((stallByUser) => {
		return stallByUser.map((stall) => {
			const identifier = createId()
			return {
				id: `${KindAuctionProduct}:${stall.userId}:${identifier}`,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				identifier: identifier,
				stallId: stall.id,
				userId: stall.userId,
				productName: faker.commerce.productName(),
				description: faker.commerce.productDescription(),
				productType: faker.helpers.arrayElement(Object.values(PRODUCT_TYPES)),
				currency: faker.helpers.arrayElement(CURRENCIES),
				stockQty: faker.number.int(),
				parentId: null,
				startingBidAmount: faker.finance.amount(),
				startDate: faker.date.recent(),
				endDate: faker.date.future(),
				specs: faker.commerce.productMaterial() || null,
				status: faker.helpers.arrayElement(Object.values(AUCTION_STATUS)),
				extraCost: faker.finance.amount(),
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
				bidStatus: faker.helpers.arrayElement(Object.values(BID_STATUS)),
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
					status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
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
				invoiceStatus: faker.helpers.arrayElement(Object.values(INVOICE_STATUS)),
				paymentMethod: faker.helpers.arrayElement(Object.values(PAYMENT_DETAILS_METHOD)),
				paymentDetails: faker.finance.creditCardNumber(),
			} as Invoice
		})
	})

	const categoryData = randomLengthArrayFromTo(5, 10).map(() => {
		const category: Category = {
		  id: createId(),
		  name: faker.commerce.department(),
		  description: faker.commerce.productDescription(),
		  parentId: null,
		}	  
		return category
	}) as Category[]

	const subCategoryData = randomLengthArrayFromTo(2, 5).map(() => {
		const category: Category = {
		  id: createId(),
		  name: faker.commerce.department(),
		  description: faker.commerce.productDescription(),
		  parentId: faker.helpers.arrayElement(categoryData).id,
		}	  
		return category
	}) as Category[]

	const productCategoryData = productData.flat(2).map(
		(product) =>
			({
				productId: product.id,
				catId: faker.helpers.arrayElement(categoryData).id,
			}) as ProductCategory,
	)

	const metaTypeData = Object.values(META_NAMES).map((metaName) => {
		let scope: string
		const isProductMeta = (metaName: string) => metaName in Object.values(PRODUCT_META) || metaName in Object.values(DIGITAL_PRODUCT_META)

		if (isProductMeta(metaName)) {
			scope = 'products'
		} else if (metaName in Object.values(APP_SETTINGS_META)) {
			scope = 'app_settings'
		} else {
			scope = 'products'
		}

		const metaTypes = [...Object.entries(PRODUCT_META), ...Object.entries(DIGITAL_PRODUCT_META), ...Object.entries(APP_SETTINGS_META),...Object.entries(GENERAL_META)].map(
			([_, { value, dataType }]) => ({ value, dataType }),
		)
		const findMetaType = metaTypes.find((meta) => meta.value === metaName)
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
		const galleryImages = randomLengthArrayFromTo(0, 4).map((_, index) => {
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
		return galleryImages
	})

	const userStallsEvents = userStalls.flatMap((stallList) =>
		stallList.map(
			(stall) =>
				({
					id: stall.id,
					createdAt: stall.createdAt,
					updatedAt: stall.updatedAt,
					author: stall.userId,
					kind: KindStalls,
					event: faker.string.uuid(),
				}) as Event,
		),
	)

	const userProductsEvents = productData.flatMap((productsByStall) =>
		productsByStall.flatMap((stallProducts) =>
			stallProducts.map(
				(product) =>
					({
						id: product.id,
						createdAt: product.createdAt,
						updatedAt: product.updatedAt,
						author: product.userId,
						kind: KindProducts,
						event: faker.string.uuid(),
					}) as Event,
			),
		),
	)

	const userAuctionProductsEvents = auctionsData.map((stallByUser) =>
		stallByUser.flatMap(
			(auction) =>
				({
					id: auction.id,
					createdAt: auction.createdAt,
					updatedAt: auction.updatedAt,
					author: auction.userId,
					kind: KindAuctionProduct,
					event: faker.string.uuid(),
				}) as Event,
		),
	)

	const userBidsEvents = bidsData.flatMap((auctionByStall) =>
		auctionByStall.flatMap(
			(bid) =>
				({
					id: bid.id,
					createdAt: bid.createdAt,
					updatedAt: bid.updatedAt,
					author: bid.userId,
					kind: KindBids,
					event: faker.string.uuid(),
				}) as Event,
		),
	)

	const eventData = [...userStallsEvents, ...userProductsEvents, ...userAuctionProductsEvents, ...userBidsEvents] as Event[]

	db.run(sql`PRAGMA foreign_keys = OFF;`)

	console.log('Reset start')
	const dbSchema = db._.fullSchema
	await Promise.all([
		db.delete(dbSchema.appSettings),
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
			{ table: dbSchema.appSettings, data: appSettings},
			{ table: dbSchema.users, data: fullUsers },
			{ table: dbSchema.stalls, data: userStalls.flat(1) },
			{ table: dbSchema.auctions, data: auctionsData.flat(2) },
			{ table: dbSchema.bids, data: bidsData.flat(2) },
			{ table: dbSchema.categories, data: categoryData },
			{ table: dbSchema.categories, data: subCategoryData },
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
			{ table: dbSchema.events, data: eventData.flat(1) },
		]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed done')
}

await main()
