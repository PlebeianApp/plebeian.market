import type { CatsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'

import { and, Category, db, eq, eventTags, or,  ProductCategory, products, sql } from '@plebeian/database'

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
	const result = await db.select().from(products).innerJoin(eventTags, (eq(products.eventId, eventTags.eventId))).where(and(filter.userId ? eq(products.userId, filter.userId) : undefined, filter.category ? eq(eventTags.tagValue, filter.category) : undefined))
		.groupBy(eventTags.tagValue)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)
	console.log(result)
	

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



export const getCategoriesByProductId = async (productId: string): Promise<Category[]> => {
const preparedCatByProductId = db
	.select()
	.from(categories)
	.innerJoin(productCategories, eq(productCategories.category, categories.name))
	.where(eq(productCategories.productId, sql.placeholder('productId')))
	.prepare()
	const categoriesResult = await preparedCatByProductId.execute({ productId })

	if (categoriesResult) {
		return categoriesResult.map((data) => data.categories)
	}
	error(404, 'Not found')
}
