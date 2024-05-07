import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import { db } from './database'

const dbSchema = db._.fullSchema

export type Auction = InferSelectModel<typeof dbSchema.auctions>
export type NewAuction = InferInsertModel<typeof dbSchema.auctions>

export type Bid = InferSelectModel<typeof dbSchema.bids>
export type NewBid = InferInsertModel<typeof dbSchema.bids>

export type Category = InferSelectModel<typeof dbSchema.categories>
export type NewCategory = InferInsertModel<typeof dbSchema.categories>

export type Event = InferSelectModel<typeof dbSchema.events>
export type NewEvent = InferInsertModel<typeof dbSchema.events>

export type Invoice = InferSelectModel<typeof dbSchema.invoices>
export type NewInvoice = InferInsertModel<typeof dbSchema.invoices>

export type OrderItem = InferSelectModel<typeof dbSchema.orderItems>
export type NewOrderItem = InferInsertModel<typeof dbSchema.orderItems>

export type Order = InferSelectModel<typeof dbSchema.orders>
export type NewOrder = InferInsertModel<typeof dbSchema.orders>

export type PaymentDetail = InferSelectModel<typeof dbSchema.paymentDetails>
export type NewPaymentDetail = InferInsertModel<typeof dbSchema.paymentDetails>

export type ProductCategory = InferSelectModel<typeof dbSchema.productCategories>
export type NewProductCategory = InferInsertModel<typeof dbSchema.productCategories>

export type Product = InferSelectModel<typeof dbSchema.products>
export type NewProduct = Omit<InferInsertModel<typeof dbSchema.products>, 'id' | 'createdAt' | 'updatedAt'>

export type ProductImage = InferSelectModel<typeof dbSchema.productImages>
export type NewProductImage = InferInsertModel<typeof dbSchema.productImages>

export type Stall = InferSelectModel<typeof dbSchema.stalls>
export type NewStall = InferInsertModel<typeof dbSchema.stalls>

export type Shipping = InferSelectModel<typeof dbSchema.shipping>
export type NewShipping = InferInsertModel<typeof dbSchema.shipping>

export type ShippingZone = InferSelectModel<typeof dbSchema.shippingZones>
export type NewShippingZone = InferInsertModel<typeof dbSchema.shippingZones>

export type User = InferSelectModel<typeof dbSchema.users>
export type NewUser = InferInsertModel<typeof dbSchema.users>

export type MetaType = InferSelectModel<typeof dbSchema.metaTypes>
export type NewMetaType = InferInsertModel<typeof dbSchema.metaTypes>

export type ProductMeta = InferSelectModel<typeof dbSchema.productMeta>
export type NewProductMeta = InferInsertModel<typeof dbSchema.productMeta>
