import type { GeneralFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { generalFilterSchema } from '$lib/schema'

import type { Category } from '@plebeian/database'
import { categories, db, eq, productCategories, products, sql } from '@plebeian/database'

// TODO get global categories, x
// TODO get categories by id x
// TODO get categories by user x
// TODO get categories by categoy name
// TODO get categories for stall
// TODO get products for category x
// TODO get products for category and user
// TODO get products for category and stall

export type RichCat = Pick<Category, 'id' | 'name' | 'description' | 'parentId'> & {
	productCount?: number
	stallCount?: number
	userCount?: number
}

const resolveCategory = async (cat: Category): Promise<RichCat> => {
	const [productCount] = (
		await db
			.select({
				count: sql<number>`cast(count(${productCategories.productId}) as int)`,
			})
			.from(productCategories)
			.where(eq(productCategories.catId, cat.id))
			.execute()
	).map((product) => product.count)

	return {
		id: cat.id,
		name: cat.name,
		description: cat.description,
		parentId: cat.parentId,
		productCount: productCount,
	}
}

export const getAllCategories = async (filter: GeneralFilter = generalFilterSchema.parse({})): Promise<RichCat[]> => {
	const categoriesResult = await db.query.categories.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
	})

	const richCats = await Promise.all(
		categoriesResult.map(async (stall) => {
			return await resolveCategory(stall)
		}),
	)

	if (richCats) {
		return richCats
	}

	error(404, 'Not found')
}

export const getCategoryById = async (catId: string, filter: GeneralFilter = generalFilterSchema.parse({})): Promise<Category> => {
	const catResult = await db.query.categories.findFirst({
		where: eq(categories.id, catId),
	})

	if (catResult) {
		return catResult
	}

	error(404, 'Not found')
}

const preparedCatsByUserId = db
	.select({
		id: categories.id,
		name: categories.name,
		description: categories.description,
		parentId: categories.parentId,
	})
	.from(products)
	.leftJoin(productCategories, eq(products.id, productCategories.productId))
	.leftJoin(categories, eq(productCategories.catId, categories.id))
	.where(eq(products.userId, sql.placeholder('userId')))
	.groupBy(categories.id)
	.prepare()

export const getCategoryByUserId = async (userId: string): Promise<Category[]> => {
	const categoriesResult = await preparedCatsByUserId.execute({ userId })

	if (categoriesResult) {
		return categoriesResult.map((category) => ({
			id: category.id ?? '',
			name: category.name ?? '',
			description: category.description ?? '',
			parentId: category.parentId ?? null,
		}))
	}
	error(404, 'Not found')
}

const preparedCatByProductId = db
	.select()
	.from(categories)
	.innerJoin(productCategories, eq(productCategories.catId, categories.id))
	.where(eq(productCategories.productId, sql.placeholder('productId')))
	.prepare()

export const getCategoriesByProductId = async (productId: string): Promise<Category[]> => {
	const categoriesResult = await preparedCatByProductId.execute({ productId })

	if (categoriesResult) {
		return categoriesResult.map((data) => data.categories)
	}
	throw new Error('Not found')
}
