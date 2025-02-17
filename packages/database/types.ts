import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import { db } from './database'

const dbSchema = db._.fullSchema

export type Auction = InferSelectModel<typeof dbSchema.auctions>
export type NewAuction = InferInsertModel<typeof dbSchema.auctions>

export type Bid = InferSelectModel<typeof dbSchema.bids>
export type NewBid = InferInsertModel<typeof dbSchema.bids>

export type EventTag = InferSelectModel<typeof dbSchema.eventTags>
export type NewEventTag = InferInsertModel<typeof dbSchema.eventTags>

export type Invoice = InferSelectModel<typeof dbSchema.invoices>
export type NewInvoice = InferInsertModel<typeof dbSchema.invoices>

export type OrderItem = InferSelectModel<typeof dbSchema.orderItems>
export type NewOrderItem = InferInsertModel<typeof dbSchema.orderItems>

export type Order = InferSelectModel<typeof dbSchema.orders>
export type NewOrder = InferInsertModel<typeof dbSchema.orders>

export type PaymentDetail = InferSelectModel<typeof dbSchema.paymentDetails>
export type NewPaymentDetail = InferInsertModel<typeof dbSchema.paymentDetails>

export type Product = InferSelectModel<typeof dbSchema.products>
export type NewProduct = InferInsertModel<typeof dbSchema.products>

export type ProductImage = InferSelectModel<typeof dbSchema.productImages>
export type NewProductImage = InferInsertModel<typeof dbSchema.productImages>

export type ProductShipping = InferSelectModel<typeof dbSchema.productShipping>
export type NewProductShipping = InferInsertModel<typeof dbSchema.productShipping>

export type Stall = InferSelectModel<typeof dbSchema.stalls>
export type NewStall = InferInsertModel<typeof dbSchema.stalls>

export type Shipping = InferSelectModel<typeof dbSchema.shipping>
export type NewShipping = InferInsertModel<typeof dbSchema.shipping>

export type ShippingZone = InferSelectModel<typeof dbSchema.shippingZones>
export type NewShippingZone = InferInsertModel<typeof dbSchema.shippingZones>

export type User = InferSelectModel<typeof dbSchema.users>
export type NewUser = InferInsertModel<typeof dbSchema.users>

export type UserMeta = InferSelectModel<typeof dbSchema.userMeta>
export type NewUserMeta = InferInsertModel<typeof dbSchema.userMeta>

export type MetaType = InferSelectModel<typeof dbSchema.metaTypes>
export type NewMetaType = InferInsertModel<typeof dbSchema.metaTypes>

export type ProductMeta = InferSelectModel<typeof dbSchema.productMeta>
export type NewProductMeta = InferInsertModel<typeof dbSchema.productMeta>

export type StallMeta = InferSelectModel<typeof dbSchema.stallMeta>
export type NewStallMeta = InferInsertModel<typeof dbSchema.stallMeta>

export type AppSettings = InferSelectModel<typeof dbSchema.appSettings>
export type NewAppSettings = InferInsertModel<typeof dbSchema.appSettings>

export type AppMeta = InferSelectModel<typeof dbSchema.appSettingsMeta>
export type NewAppMeta = InferInsertModel<typeof dbSchema.appSettingsMeta>
