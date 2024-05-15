import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { integer, numeric, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import {
	AUCTION_STATUS,
	AuctionStatus,
	BID_STATUS,
	BidStatus,
	INVOICE_STATUS,
	InvoiceStatus,
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
	USER_ROLES,
	USER_TRUST_LEVEL,
	UserRoles,
	UserTrustLevel,
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
	currency: text('currency').notNull(),
	stockQty: integer('stock_qty').notNull(),
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
	valueInteger: integer('value_boolean'),
	valueNumeric: numeric('value_integer'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

// Events
export const events = sqliteTable('events', {
	...standardColumns,
	author: text('author')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	kind: integer('kind').notNull(),
	event: text('event').notNull(),
})

type NonEmptyArray<T> = [T, ...T[]]

// Users table
export const users = sqliteTable('users', {
	...standardColumns,
	name: text('name'),
	role: text('role', { enum: Object.values(USER_ROLES) as NonEmptyArray<UserRoles> })
		.notNull()
		.default(USER_ROLES.PLEB),
	trustLevel: text('trust_lvl', { enum: Object.values(USER_TRUST_LEVEL) as NonEmptyArray<UserTrustLevel> }),
	displayName: text('display_name'),
	about: text('about'),
	image: text('image'),
	banner: text('banner'),
	nip05: text('nip05'),
	lud06: text('lud06'),
	lud16: text('lud16'),
	website: text('website'),
	zapService: text('zap_Service'),
	lastLogin: integer('last_login', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

// Stalls table
export const stalls = sqliteTable('stalls', {
	...standardColumns,
	name: text('name').notNull(),
	description: text('description').notNull(),
	identifier: text('identifier').notNull(),
	currency: text('currency').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

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
	...standardColumns,
	stallId: text('stall_id').references(() => stalls.id, { onUpdate: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	name: text('name').notNull(),
	shippingMethod: text('shipping_method').notNull(),
	shippingDetails: text('shipping_details').notNull(),
	baseCost: numeric('base_cost').notNull(),
	isDefault: integer('default', { mode: 'boolean' }).notNull().default(false),
})

// Shipping zones
export const shippingZones = sqliteTable('shipping_zones', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	shippingId: text('shipping_id')
		.notNull()
		.references(() => shipping.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	stallId: text('stall_id').references(() => stalls.id, { onUpdate: 'cascade' }),
	regionCode: text('region_code').notNull(),
	countryCode: text('country_code').notNull(),
})

// Products
export const products = sqliteTable('products', {
	...standardColumns,
	...standardProductColumns,
	productType: text('product_type', { enum: Object.values(PRODUCT_TYPES) as NonEmptyArray<ProductTypes> })
		.notNull()
		.default('simple'),
	parentId: text('parent_id').references((): AnySQLiteColumn => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	price: numeric('price').notNull(),
})

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

// Categories
export const categories = sqliteTable('categories', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description').notNull(),
	parentId: text('parent_id').references((): AnySQLiteColumn => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

// Product categories
export const productCategories = sqliteTable(
	'product_categories',
	{
		productId: text('product_id').references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		catId: text('cat_id').references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.productId, table.catId] }),
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
	buyerUserId: text('buyer_user_id')
		.notNull()
		.references(() => users.id),
	status: text('status', { enum: Object.values(ORDER_STATUS) as NonEmptyArray<OrderStatus> })
		.notNull()
		.default('pending'),
	shippingId: text('shipping_id')
		.notNull()
		.references(() => shipping.id),
	stallId: text('stall_id')
		.notNull()
		.references(() => stalls.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	address: text('address').notNull(), // Can be encrypted
	zip: text('zip').notNull(), // Can be encrypted
	city: text('city').notNull(), // Can be encrypted
	region: text('region').notNull(), // Can be encrypted
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
			.references(() => products.id),
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
	invoiceStatus: text('invoice_status', { enum: Object.values(INVOICE_STATUS) as NonEmptyArray<InvoiceStatus> })
		.notNull()
		.default('pending'),
	paymentDetails: text('payment_details_id')
		.notNull()
		.references(() => paymentDetails.id),
})
