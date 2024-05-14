import { z } from 'zod'

export const productEventSchema = z.object({
	id: z.string(),
	stall_id: z.string(),
	name: z.string(),
	type: z.string().optional(),
	description: z.string().optional(),
	images: z.array(z.string()).optional(),
	currency: z.string(),
	price: z.number(),
	quantity: z.number().int().nullable(),
	specs: z.array(z.tuple([z.string(), z.string()])).optional(),
	shipping: z
		.array(
			z.object({
				id: z.string(),
				cost: z.number(),
			}),
		)
		.optional(),
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
	currency: z.string(),
	shipping: z.array(
		z.object({
			id: z.string(),
			name: z.string().optional(),
			cost: z.number(),
			regions: z.array(z.string()),
		}),
	),
})

export const userEventSchema = z.object({
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
