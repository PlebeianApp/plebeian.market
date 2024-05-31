import type { CatsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'

import type { Category } from '@plebeian/database'
import { and, categories, db, eq, productCategories, sql } from '@plebeian/database'

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
	const categoriesResult = await db
		.select()
		.from(categories)
		.where(
			and(
				filter.catName ? eq(categories.name, filter.catName) : undefined,
				filter.catId ? eq(categories.id, filter.catId) : undefined,
				filter.userId ? eq(categories.userId, filter.userId) : undefined,
			),
		)
		.groupBy(categories.name)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)

	const richCats = await Promise.all(
		categoriesResult.map(async (cat) => {
			return await resolveCategory(cat)
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
	error(404, 'Not found')
}
