import { z } from 'zod'

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
})

export type UsersFilter = z.infer<typeof usersFilterSchema>

export const productsFilterSchema = generalFilterSchema.extend({
	orderBy: z.enum(['createdAt', 'price']).default('createdAt'),
	stallId: z.string().optional(),
	userId: z.string().optional(),
	catId: z.string().optional(),
	catName: z.string().optional(),
})

export type ProductsFilter = z.infer<typeof productsFilterSchema>

export const stallsFilterSchema = generalFilterSchema.extend({
	userId: z.string().optional(),
	orderBy: z.enum(['createdAt']).default('createdAt'),
})

export type StallsFilter = z.infer<typeof stallsFilterSchema>

export const catsFilterSchema = generalFilterSchema.extend({
	userId: z.string().optional(),
	catId: z.string().optional(),
	catName: z.string().optional(),
})

export type CatsFilter = z.infer<typeof catsFilterSchema>

export const initialSetupDataSchema = z.object({
	instancePk: z.string().startsWith('npub'),
	ownerPk: z.string().startsWith('npub').optional(),
	adminsList: z.array(z.string().startsWith('npub')).optional(),
	instanceName: z.string(),
	logoUrl: z.string().url().optional(),
	contactEmail: z.string().email().optional(),
	defaultCurrency: z.string(),
	allowRegister: z.coerce.boolean(),
})
