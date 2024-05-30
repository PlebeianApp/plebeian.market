import type { CatsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'

import type { Category } from '@plebeian/database'
import { and, categories, db, eq, inArray, productCategories, sql } from '@plebeian/database'

// TODO get global categories, x
// TODO get categories by id x
// TODO get categories by user x
// TODO get categories by categoy name
// TODO get categories for stall
// TODO get products for category x
// TODO get products for category and user
// TODO get products for category and stall

export type RichCat = Pick<Category, 'id' | 'name' | 'description' | 'parentId' | 'userId'> & {
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
		userId: cat.userId,
		productCount: productCount,
	}
}

export const getAllCategories = async (filter: CatsFilter = catsFilterSchema.parse({})): Promise<RichCat[]> => {
	const categoriesResult = await db.query.categories.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		where: and(
			filter.catId ? inArray(categories.id, filter.catId) : undefined,
			filter.userId ? inArray(categories.userId, filter.userId) : undefined,
			filter.catName ? inArray(categories.name, filter.catName) : undefined,
		),
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
