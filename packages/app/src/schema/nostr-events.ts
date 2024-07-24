import { KindStalls } from '$lib/constants'
import { z } from 'zod'

import type { ProductTypes } from '@plebeian/database'
import { PRODUCT_TYPES } from '@plebeian/database/constants'

const forbiddenWords = new Set([
	'test',
	'testing',
	'TestStore',
	'example',
	'dummy',
	'fake',
	'demo',
	'sample',
	'trial',
	'sandbox',
	'mock',
	'placeholder',
	'lorem',
	'admin',
	'password',
])

const escapedWords = Array.from(forbiddenWords).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const forbiddenPattern = new RegExp(`(?:^|\\s)(${escapedWords.join('|')})(?:$|\\s|[^a-z])`, 'i')

const productTypeValidator = (value: unknown) => {
	if (typeof value !== 'string') {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	if (!Object.values(PRODUCT_TYPES).includes(value as ProductTypes)) {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	return value
}

export const shippingObjectSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	cost: z.preprocess((value) => (typeof value === 'number' ? value.toString() : value), z.string().optional()),
	regions: z.array(z.string()).optional(),
	countries: z.array(z.string()).optional(),
})

export const productEventSchema = z
	.object({
		id: z.string(),
		stall_id: z.string().refine((value) => !value.startsWith(KindStalls.toString()), {
			message: `stallId must be and identifier ("d" tag)`,
		}),
		name: z.string(),
		type: z.custom(productTypeValidator).optional(),
		description: z.string().optional(),
		images: z.array(z.string()).optional(),
		currency: z.string(),
		price: z.number(),
		quantity: z.number().int(),
		specs: z.array(z.tuple([z.string(), z.string()])).optional(),
		shipping: z.array(shippingObjectSchema),
	})
	.partial()
	.transform((data) => {
		const { stall_id, ...rest } = data
		return {
			...rest,
			stallId: data.stall_id,
		}
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
	shipping: z.array(shippingObjectSchema),
})

export const bidEventSchema = z.number().int()

export const stallEventSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.trim()
		.refine((name) => !forbiddenPattern.test(name), {
			message: `Name cannot contain a forbidden word}`,
		}),
	description: z
		.string()
		.optional()
		.refine((description) => description === undefined || !forbiddenPattern.test(description) || !description.trim().length, {
			message: `Description cannot contain any forbidden word}`,
		}),
	currency: z.string(),
	shipping: z.array(shippingObjectSchema),
})

export const userEventSchema = z.object({
	id: z.string(),
	name: z.string().optional().nullable(),
	about: z.string().optional().nullable(),
	picture: z.string().optional().nullable(),
	banner: z.string().optional().nullable(),
	nip05: z.string().optional().nullable(),
	lud06: z.string().optional().nullable(),
	lud16: z.string().optional().nullable(),
	website: z.string().optional().nullable(),
	zapService: z.string().optional().nullable(),
	displayName: z.string().optional().nullable(),
	image: z.string().optional().nullable(),
})
