import { z } from 'zod'

import type { NonEmptyArray, ProductTypes } from '@plebeian/database'
import type { ISO3 } from '@plebeian/database/constants'
import { COUNTRIES_ISO, CURRENCIES, PRODUCT_TYPES } from '@plebeian/database/constants'

const productTypeValidator = (value: unknown) => {
	if (typeof value !== 'string') {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	if (!Object.values(PRODUCT_TYPES).includes(value as ProductTypes)) {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	return value
}

export const productEventSchema = z.object({
	id: z.string(),
	stall_id: z.string(),
	name: z.string(),
	type: z.custom(productTypeValidator).optional(),
	description: z.string().optional(),
	images: z.array(z.string()).optional(),
	currency: z.string(),
	price: z.number(),
	quantity: z.number().int().nullable(),
	specs: z.array(z.tuple([z.string(), z.string()])).optional(),
	shipping: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			baseCost: z.string(),
			regions: z.array(z.enum(Object.values(COUNTRIES_ISO).map((c) => c.iso3) as NonEmptyArray<ISO3>)),
		}),
	),
})

export const auctionEventSchema = z.object({
	id: z.string(),
	stall_id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	images: z.array(z.string()).optional(),
	starting_bid: z.number().int(),
	start_date: z.number().int().optional(),
	duration: z.number().int(),
	specs: z.array(z.tuple([z.string(), z.string()])),
	shipping: z.array(
		z.object({
			id: z.string(),
			cost: z.number(),
		}),
	),
})

export const bidEventSchema = z.number().int()

export const stallEventSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	currency: z.enum(CURRENCIES),
	shipping: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			baseCost: z.string(),
			regions: z.array(z.enum(Object.values(COUNTRIES_ISO).map((c) => c.iso3) as NonEmptyArray<ISO3>)),
		}),
	),
})

export const userEventSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	about: z.string().optional(),
	picture: z.string().optional(),
	banner: z.string().optional(),
	nip05: z.string().optional(),
	lud06: z.string().optional(),
	lud16: z.string().optional(),
	website: z.string().optional(),
	zapService: z.string().optional(),
	displayName: z.string().optional(),
	image: z.string().optional(),
})
