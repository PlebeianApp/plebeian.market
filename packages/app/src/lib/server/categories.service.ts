import type { CatsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'

import { and, categories, Category, db, eq, getTableColumns, or, productCategories, ProductCategory, sql } from '@plebeian/database'

export type RichCat = Pick<Category, 'name' | 'description' | 'parent'> & {
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
			.where(eq(productCategories.category, cat.name))
			.execute()
	).map((product) => product.count)

	return {
		name: cat.name,
		description: cat.description,
		parent: cat.parent,
		productCount: productCount,
	}
}

export const getAllCategories = async (filter: CatsFilter = catsFilterSchema.parse({})): Promise<RichCat[]> => {
	let userCategories: { category: string }[] = []
	if (filter.userId) {
		userCategories = await db
			.selectDistinct({ category: categories.name })
			.from(productCategories)
			.orderBy(productCategories.category)
			.innerJoin(categories, eq(productCategories.category, categories.name))
			.where(eq(productCategories.userId, filter.userId))
	}

	const categoriesResult = await db
		.select()
		.from(categories)
		.where(
			and(
				filter.category ? eq(categories.name, filter.category) : undefined,
				or(...userCategories.map(({ category }) => eq(categories.name, category))),
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

	error(404, { message: `No categories found` })
}

const preparedCatByProductId = db
	.select()
	.from(categories)
	.innerJoin(productCategories, eq(productCategories.category, categories.name))
	.where(eq(productCategories.productId, sql.placeholder('productId')))
	.prepare()

export const getCategoriesByProductId = async (productId: string): Promise<Category[]> => {
	const categoriesResult = await preparedCatByProductId.execute({ productId })

	if (categoriesResult) {
		return categoriesResult.map((data) => data.categories)
	}
	error(404, 'Not found')
}
