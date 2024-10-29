import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import { derived, get } from 'svelte/store'
import { z } from 'zod'

import type { ProductTypes } from '@plebeian/database'
import { PRODUCT_TYPES } from '@plebeian/database/constants'

import type { PageData } from '../routes/$types'

const productTypeValidator = (value: unknown) => {
	if (typeof value !== 'string') {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	if (!Object.values(PRODUCT_TYPES).includes(value as ProductTypes)) {
		return { error: new Error(`Invalid product type: ${value}`) }
	}
	return value
}

export const forbiddenPatternStore = derived(page, ($page) => {
	const forbiddenPattern = ($page.data as PageData).forbiddenWords.forbiddenPattern
	return {
		createProductEventSchema: createProductEventSchema(forbiddenPattern),
		createStallEventContentSchema: createStallEventContentSchema(forbiddenPattern),
	}
})

export const shippingObjectSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	cost: z.preprocess((value) => (typeof value === 'number' ? value.toString() : value), z.string().optional()),
	regions: z.array(z.string()).optional(),
	countries: z.array(z.string()).optional(),
})

export const productShippingObjectSchema = z.object({
	id: z.string(),
	cost: z.preprocess((value) => (typeof value === 'number' ? value.toString() : value), z.string().optional()),
})

export const createProductEventSchema = (forbiddenPattern: RegExp) =>
	z
		.object({
			id: z.string(),
			stall_id: z.string().refine((value) => !value.startsWith(KindStalls.toString()), {
				message: `stallId must be and identifier ("d" tag)`,
			}),
			name: z
				.string()
				.trim()
				.refine((name) => !forbiddenPattern.test(name), {
					message: `forbidden word`,
				}),
			type: z.custom(productTypeValidator).optional(),
			description: z
				.string()
				.optional()
				.refine((description) => description === undefined || !forbiddenPattern.test(description) || !description.trim().length, {
					message: `forbidden word`,
				}),
			images: z.array(z.string()).optional(),
			currency: z.string(),
			price: z.number(),
			quantity: z.number().int(),
			specs: z.array(z.tuple([z.string(), z.string()])).optional(),
			shipping: z.array(productShippingObjectSchema),
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

export const createStallEventContentSchema = (forbiddenPattern: RegExp) =>
	z.object({
		id: z.string(),
		name: z
			.string()
			.trim()
			.refine((name) => !forbiddenPattern.test(name), {
				message: `forbidden word`,
			}),
		description: z
			.string()
			.optional()
			.refine((description) => description === undefined || !forbiddenPattern.test(description) || !description.trim().length, {
				message: `forbidden word`,
			}),
		currency: z.string(),
		shipping: z.array(shippingObjectSchema).nonempty(),
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
