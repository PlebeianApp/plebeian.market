import { z } from 'zod'

import type { InvoiceStatus, OrderStatus } from '@plebeian/database/constants'
import { INVOICE_STATUS, ORDER_STATUS } from '@plebeian/database/constants'

import { validUrls } from './constants'

export const generalFilterSchema = z.object({
	pageSize: z.coerce.number().min(1).default(10),
	page: z.coerce.number().min(1).default(1),
	order: z.enum(['asc', 'desc']).default('asc'),
})

export type GeneralFilter = z.infer<typeof generalFilterSchema>

export const auctionsFilterSchema = generalFilterSchema.extend({
	orderBy: z.enum(['createdAt', 'startDate', 'endDate']).default('createdAt'),
})

export type AuctionsFilter = z.infer<typeof auctionsFilterSchema>

export const usersFilterSchema = generalFilterSchema.extend({
	orderBy: z.enum(['createdAt']).default('createdAt'),
	userId: z.string().optional(),
	role: z.string().optional(),
})

export type UsersFilter = z.infer<typeof usersFilterSchema>

export const productsFilterSchema = generalFilterSchema.extend({
	search: z.string().optional(),
	orderBy: z.enum(['createdAt', 'price']).default('createdAt'),
	stallId: z.string().optional(),
	userId: z.string().optional(),
	category: z.string().optional(),
})

export type ProductsFilter = z.infer<typeof productsFilterSchema>

export const stallsFilterSchema = generalFilterSchema.extend({
	stallId: z.string().optional(),
	userId: z.string().optional(),
	orderBy: z.enum(['createdAt']).default('createdAt'),
})

export type StallsFilter = z.infer<typeof stallsFilterSchema>

export const shippingFilterSchema = generalFilterSchema.extend({
	stallId: z.string().optional(),
})

export type ShippingFilter = z.infer<typeof shippingFilterSchema>

export const catsFilterSchema = generalFilterSchema.extend({
	userId: z.string().optional(),
	category: z.string().optional(),
})

export type CatsFilter = z.infer<typeof catsFilterSchema>

export const initialSetupDataSchema = z.object({
	instancePk: z.string().startsWith('npub'),
	instanceSk: z.string().startsWith('ncryptsec'),
	ownerPk: z.string().startsWith('npub').optional(),
	adminsList: z.array(z.string().startsWith('npub')).optional(),
	instanceName: z.string().max(24),
	logoUrl: z.union([z.string().url(), z.enum(validUrls), z.null()]).optional(),
	contactEmail: z.union([z.string().email(), z.null()]).optional(),
	defaultCurrency: z.string(),
	allowRegister: z.coerce.boolean(),
	isFirstTimeRunning: z.coerce.boolean().optional(),
})

export const postProductImageSchema = z.object({
	productId: z.string(),
	imageUrl: z.string(),
	newImageUrl: z.string().optional(),
	imageOrder: z.number().optional(),
	imageType: z.string().optional(),
})

export type PostProductImageFilter = z.infer<typeof postProductImageSchema>

export const ordersFilterSchema = generalFilterSchema.extend({
	orderBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
	userId: z.string().optional(),
	orderId: z.string().optional(),
	role: z.enum(['buyer', 'seller']).optional(),
})

export type OrdersFilter = z.infer<typeof ordersFilterSchema>

export const orderSchema = z.object({
	id: z.string(),
	type: z.number(),
	sellerUserId: z.string(),
	buyerUserId: z.string(),
	shippingId: z.string(),
	stallId: z.string(),
	status: z.enum(Object.values(ORDER_STATUS) as NonEmptyArray<OrderStatus>),
	address: z.string(),
	zip: z.string(),
	city: z.string(),
	country: z.string(),
	region: z.string().optional(),
	contactName: z.string(),
	contactPhone: z.string().optional(),
	contactEmail: z.string().optional(),
	observations: z.string().optional(),
	items: z.array(
		z.object({
			product_id: z.string(),
			quantity: z.number(),
		}),
	),
})

export type OrderFilter = z.infer<typeof orderSchema>

export const createInvoiceFilter = z.object({
	orderId: z.string(),
	totalAmount: z.string(),
	paymentDetails: z.string(),
})

export type CreateInvoiceFilter = z.infer<typeof createInvoiceFilter>

type NonEmptyArray<T> = [T, ...T[]]

export const updateInvoiceFilter = z.object({
	invoiceStatus: z.enum(Object.values(INVOICE_STATUS) as NonEmptyArray<InvoiceStatus>),
	paymentDetails: z.string(),
	proof: z.string(),
})

export type UpdateInvoiceFilter = z.infer<typeof updateInvoiceFilter>

export const checkoutFormSchema = z.object({
	contactName: z.string().min(1, 'Name is required'),
	contactPhone: z.string().optional(),
	contactEmail: z.string().email('Invalid email').optional(),
	address: z.string().min(1, 'Address is required'),
	zip: z.string().min(1, 'ZIP is required'),
	city: z.string().min(1, 'City is required'),
	country: z.string().min(1, 'Country is required'),
	region: z.string().optional(),
	observations: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>

export const OrderInDbSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	sellerUserId: z.string(),
	buyerUserId: z.string(),
	status: z.enum(Object.values(ORDER_STATUS) as NonEmptyArray<OrderStatus>),
	shippingId: z.string().nullable(),
	stallId: z.string(),
	address: z.string(),
	zip: z.string(),
	city: z.string(),
	country: z.string(),
	region: z.string().nullable(),
	contactName: z.string(),
	contactPhone: z.string().nullable(),
	contactEmail: z.string().nullable(),
	observations: z.string().nullable(),
})

export const OrderItemInDbSchema = z.object({
	orderId: z.string(),
	productId: z.string(),
	qty: z.number().int().positive(),
})

export const InvoiceInDbSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	orderId: z.string(),
	totalAmount: z.number(),
	invoiceStatus: z.enum(Object.values(INVOICE_STATUS) as NonEmptyArray<InvoiceStatus>),
	paymentDetails: z.string(),
	paymentRequest: z.string().nullable(),
	proof: z.string().nullable(),
})

export type OrderInDb = z.infer<typeof OrderInDbSchema>
export type OrderItemInDb = z.infer<typeof OrderItemInDbSchema>
export type InvoiceInDb = z.infer<typeof InvoiceInDbSchema>
