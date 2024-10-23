import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'
import { foreignKey, integer, numeric, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

import {
	AUCTION_STATUS,
	AuctionStatus,
	BID_STATUS,
	BidStatus,
	INVOICE_STATUS,
	INVOICE_TYPE,
	InvoiceStatus,
	InvoiceType,
	META_DATA_TYPES,
	META_NAMES,
	META_SCOPES,
	MetaDataTypes,
	MetaName,
	MetaScopes,
	ORDER_STATUS,
	OrderStatus,
	PAYMENT_DETAILS_METHOD,
	PaymentDetailsMethod,
	PRODUCT_IMAGES_TYPE,
	PRODUCT_TYPES,
	ProductImagesType,
	ProductTypes,
} from './constants'
import { createId } from './utils'

const standardColumns = {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
}

const standardProductColumns = {
	stallId: text('stall_id')
		.notNull()
		.references(() => stalls.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	identifier: text('identifier').notNull(),
	productName: text('product_name').notNull(),
	description: text('description').notNull(),
	currency: text('currency'),
	quantity: integer('quantity').notNull(),
	extraCost: numeric('extra_cost').notNull().default('0'),
}

/// Meta tables
// Meta types
export const metaTypes = sqliteTable('meta_types', {
	name: text('name', { enum: Object.values(META_NAMES) as NonEmptyArray<MetaName> }).primaryKey(),
	description: text('description'),
	scope: text('scope', { enum: Object.values(META_SCOPES) as NonEmptyArray<MetaScopes> }).notNull(),
	dataType: text('data_type', { enum: Object.values(META_DATA_TYPES) as NonEmptyArray<MetaDataTypes> }).notNull(),
})

// Product meta
export const productMeta = sqliteTable('product_meta', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	productId: text('product_id').references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	auctionId: text('auction_id').references(() => auctions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	metaName: text('meta_name')
		.notNull()
		.references(() => metaTypes.name, { onDelete: 'cascade', onUpdate: 'cascade' }),
	key: text('key'),
	valueText: text('value_text'),
	valueBoolean: integer('value_boolean', { mode: 'boolean' }),

	valueNumeric: numeric('value_number'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

// App settings meta
export const appSettingsMeta = sqliteTable('app_meta', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	appId: text('app_id').references(() => appSettings.instancePk, { onDelete: 'cascade', onUpdate: 'cascade' }),
	metaName: text('meta_name')
		.notNull()
		.references(() => metaTypes.name, { onDelete: 'cascade', onUpdate: 'cascade' }),
	key: text('key'),
	valueText: text('value_text'),
	valueBoolean: integer('value_boolean', { mode: 'boolean' }),
	valueNumeric: numeric('value_number'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

export type NonEmptyArray<T> = [T, ...T[]]

// Users table
export const users = sqliteTable('users', {
	...standardColumns,
	name: text('name'),
	displayName: text('display_name'),
	about: text('about'),
	image: text('image'),
	banner: text('banner'),
	nip05: text('nip05'),
	lud06: text('lud06'),
	lud16: text('lud16'),
	website: text('website'),
	zapService: text('zap_Service'),
	lastLogin: integer('last_login', { mode: 'timestamp' }),
})

// Users meta table
export const userMeta = sqliteTable('user_meta', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	metaName: text('meta_name')
		.notNull()
		.references(() => metaTypes.name, { onDelete: 'cascade', onUpdate: 'cascade' }),
	key: text('key'),
	valueText: text('value_text'),
	valueBoolean: integer('value_boolean', { mode: 'boolean' }),
	valueNumeric: numeric('value_number'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

// Stalls table
export const stalls = sqliteTable(
	'stalls',
	{
		...standardColumns,
		name: text('name').notNull(),
		description: text('description').notNull(),
		identifier: text('identifier').notNull(),
		currency: text('currency').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	},
	(table) => ({
		uniqueIdCurrency: unique().on(table.id, table.currency),
	}),
)

// Payment details
export const paymentDetails = sqliteTable('payment_details', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	stallId: text('stall_id').references(() => stalls.id, { onUpdate: 'cascade' }),
	paymentMethod: text('payment_method', { enum: Object.values(PAYMENT_DETAILS_METHOD) as NonEmptyArray<PaymentDetailsMethod> }).notNull(),
	paymentDetails: text('payment_details').notNull(),
	isDefault: integer('default', { mode: 'boolean' }).notNull().default(false),
})

// Shipping
export const shipping = sqliteTable('shipping', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	stallId: text('stall_id').references(() => stalls.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	name: text('name'),
	cost: numeric('base_cost').notNull(),
	isDefault: integer('default', { mode: 'boolean' }).notNull().default(false),
})

export const shippingZones = sqliteTable(
	'shipping_zones',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		shippingId: text('shipping_id')
			.notNull()
			.references(() => shipping.id, { onDelete: 'cascade' }),
		shippingUserId: text('shipping_user_id').notNull(),
		stallId: text('stall_id').references(() => stalls.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		regionCode: text('region_code'),
		countryCode: text('country_code'),
	},
	(table) => {
		return {
			uniqueConstraint: unique().on(table.shippingId, table.regionCode, table.countryCode),
		}
	},
)

export const productShipping = sqliteTable(
	'product_shipping',
	{
		productId: text('product_id').references(() => products.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
		shippingId: text('shipping_id')
			.notNull()
			.references(() => shipping.id, { onDelete: 'cascade' }),
		cost: numeric('extra_cost').notNull(),
	},
	(t) => {
		return {
			pk: primaryKey({ columns: [t.productId, t.shippingId] }),
		}
	},
)

// Shipping relations
export const shippingRelations = relations(shipping, ({ many }) => ({
	shippingZones: many(shippingZones),
}))

export const shippingZoneRelations = relations(shippingZones, ({ one }) => ({
	shipping: one(shipping, { fields: [shippingZones.shippingId, shippingZones.shippingUserId], references: [shipping.id, shipping.userId] }),
}))

// Events
export const eventTags = sqliteTable(
	'event_tags',
	{
		tagName: text('tag_name').notNull(),
		tagValue: text('tag_value').notNull(),
		secondTagValue: text('second_tag_value'),
		thirdTagValue: text('third_tag_value'),
		eventId: text('event_id').notNull(),
		userId: text('user_id')
			.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		eventKind: integer('event_kind').notNull(),
	},
	(t) => {
		return {
			pk: primaryKey({ columns: [t.tagName, t.tagValue, t.eventId] }),
		}
	},
)

// Products
export const products = sqliteTable(
	'products',
	{
		...standardColumns,
		...standardProductColumns,
		productType: text('product_type', { enum: Object.values(PRODUCT_TYPES) as NonEmptyArray<ProductTypes> })
			.notNull()
			.default('simple'),
		parentId: text('parent_id').references((): AnySQLiteColumn => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		price: numeric('price').notNull(),
	},
	(table) => ({
		stallCurrencyFk: foreignKey({
			columns: [table.stallId, table.currency],
			foreignColumns: [stalls.id, stalls.currency],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	}),
)

export const productToEventsRelations = relations(products, ({ many }) => ({
	categories: many(eventTags),
}))

export const productImages = sqliteTable(
	'product_images',
	{
		productId: text('product_id').references(() => products.id, { onDelete: 'set null', onUpdate: 'cascade' }),
		auctionId: text('auction_id').references(() => auctions.id, { onDelete: 'set null', onUpdate: 'cascade' }),
		imageUrl: text('image_url'),
		imageType: text('image_type', { enum: Object.values(PRODUCT_IMAGES_TYPE) as NonEmptyArray<ProductImagesType> })
			.notNull()
			.default('gallery'),
		imageOrder: integer('image_order').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.productId, table.auctionId, table.imageUrl] }),
		}
	},
)

// Auctions
export const auctions = sqliteTable('auctions', {
	...standardColumns,
	...standardProductColumns,
	startingBidAmount: numeric('starting_bid_amount').notNull(),
	status: text('status', { enum: Object.values(AUCTION_STATUS) as NonEmptyArray<AuctionStatus> }).notNull(),
	startDate: integer('start_date', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	endDate: integer('end_date', { mode: 'timestamp' }),
})

//Bids
export const bids = sqliteTable('bids', {
	...standardColumns,
	auctionId: text('auction_id')
		.notNull()
		.references(() => auctions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	bidAmount: numeric('bid_amount').notNull(),
	bidStatus: text('bid_status', { enum: Object.values(BID_STATUS) as NonEmptyArray<BidStatus> })
		.notNull()
		.default('pending'),
})

//Orders
export const orders = sqliteTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	sellerUserId: text('seller_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	buyerUserId: text('buyer_user_id').notNull(), // This can be encrypted with the seller's key in case buyer its paranoid
	status: text('status', { enum: Object.values(ORDER_STATUS) as NonEmptyArray<OrderStatus> })
		.notNull()
		.default('pending'),
	shippingId: text('shipping_id').references(() => shipping.id, { onDelete: 'set null' }),
	stallId: text('stall_id')
		.notNull()
		.references(() => stalls.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	address: text('address').notNull(), // Can be encrypted
	zip: text('zip').notNull(), // Can be encrypted
	city: text('city').notNull(), // Can be encrypted
	country: text('country').notNull(), // Can be encrypted
	region: text('region'), // Can be encrypted
	contactName: text('contact_name').notNull(), // Can be encrypted
	contactPhone: text('contact_phone'), // Can be encrypted
	contactEmail: text('contact_email'), // Can be encrypted
	observations: text('observations'), // Can be encrypted
})
// Order items
export const orderItems = sqliteTable(
	'order_items',
	{
		orderId: text('order_id')
			.notNull()
			.references(() => orders.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		qty: integer('qty').notNull(),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.orderId, table.productId] }),
		}
	},
)

// Invoices
export const invoices = sqliteTable('invoices', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	totalAmount: numeric('total_amount').notNull(),
	type: text('type', { enum: Object.values(INVOICE_TYPE) as NonEmptyArray<InvoiceType> }).notNull(),
	invoiceStatus: text('invoice_status', { enum: Object.values(INVOICE_STATUS) as NonEmptyArray<InvoiceStatus> })
		.notNull()
		.default('pending'),
	observations: text('observations'),
	paymentDetails: text('payment_details_id').notNull(),
	paymentRequest: text('payment_request'),
	proof: text('proof'),
})

// App Settings
export const appSettings = sqliteTable('app_settings', {
	instancePk: text('instance_pk').primaryKey(),
	instanceSk: text('instance_sk').notNull(),
	isFirstTimeRunning: integer('is_first_time_running', { mode: 'boolean' }).notNull().default(true),
	instanceName: text('instance_name').notNull().default('Plebeian Market'),
	logoUrl: text('logo_url').notNull().default('/logo.svg'),
	contactEmail: text('contact_email'),
	ownerPk: text('owner_pk'),
	allowRegister: integer('allow_register', { mode: 'boolean' }).notNull().default(true),
	defaultCurrency: text('default_currency').notNull().default('BTC'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})
