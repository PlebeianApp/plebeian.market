import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { integer, numeric, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import {
	allowedMetaNames,
	auctionStatus,
	bidStatus,
	invoiceStatus,
	metaDataTypes,
	metaScopes,
	orderStatus,
	paymentDetailsMethod,
	productImagesType,
	productTypes,
	userRoles,
	userTrustLevel,
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
	productName: text('product_name').notNull(),
	description: text('description').notNull(),
	productType: text('product_type', { enum: [productTypes[0], ...productTypes.slice(1)] })
		.notNull()
		.default('simple'),
	currency: text('currency').notNull(),
	stockQty: integer('stock_qty').notNull(),
	extraCost: numeric('extra_cost').notNull().default('0'),
	parentId: text('parent_id').references((): AnySQLiteColumn => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}

/// Meta tables
// Meta types
export const metaTypes = sqliteTable('meta_types', {
	name: text('name', { enum: [allowedMetaNames[0], ...allowedMetaNames.slice(1)] }).primaryKey(),
	description: text('description'),
	scope: text('scope', { enum: [metaScopes[0], ...metaScopes.slice(1)] }).notNull(),
	dataType: text('data_type', { enum: [metaDataTypes[0], ...metaDataTypes.slice(1)] }).notNull(),
})

// Product meta
export const productMeta = sqliteTable('product_meta', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	productId: text('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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

// Users table
export const users = sqliteTable('users', {
	...standardColumns,
	name: text('name'),
	role: text('role', { enum: [userRoles[0], ...userRoles.slice(1)] })
		.notNull()
		.default('pleb'),
	trustLevel: text('trust_lvl', { enum: [userTrustLevel[0], ...userTrustLevel.slice(1)] }),
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
	paymentMethod: text('payment_method', { enum: [paymentDetailsMethod[0], ...paymentDetailsMethod.slice(1)] }).notNull(),
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
	price: numeric('price').notNull(),
})

export const productImages = sqliteTable(
	'product_images',
	{
		productId: text('product_id').references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		imageUrl: text('image_url'),
		imageType: text('image_type', { enum: [productImagesType[0], ...productImagesType.slice(1)] })
			.notNull()
			.default('gallery'),
		imageOrder: integer('image_order').notNull().default(0),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.productId, table.imageUrl] }),
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
	startDate: integer('start_date', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
	status: text('status', { enum: [auctionStatus[0], ...auctionStatus.slice(1)] }).notNull(),
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
	bidStatus: text('bid_status', { enum: [bidStatus[0], ...bidStatus.slice(1)] })
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
	status: text('status', { enum: [orderStatus[0], ...orderStatus.slice(1)] })
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
	invoiceStatus: text('invoice_status', { enum: [invoiceStatus[0], ...invoiceStatus.slice(1)] })
		.notNull()
		.default('pending'),
	paymentDetails: text('payment_details_id')
		.notNull()
		.references(() => paymentDetails.id),
})
