import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import { and, countDistinct, db, desc, eq, eventTags, like, products, SQL } from '@plebeian/database'

export type RichCat = {
	name: string
	productCount: number
}

export const getAllCategories = async (filter: CatsFilter = catsFilterSchema.parse({})) => {
	const query = db
		.select({
			category: eventTags.tagValue,
			productCount: countDistinct(products.id),
		})
		.from(eventTags)
		.$dynamic()

	const where: SQL[] = [eq(eventTags.tagName, 't'), eq(products.banned, false)]

	if (filter.userId) {
		where.push(eq(eventTags.userId, filter.userId))
	}
	if (filter.category) {
		where.push(eq(eventTags.tagValue, filter.category))
	}
	if (filter.search) {
		where.push(like(eventTags.tagValue, `%${filter.search.replaceAll(' ', '%')}%`))
	}

	const categoriesWithCounts = await query
		.innerJoin(products, eq(products.id, eventTags.eventId))
		.groupBy(eventTags.tagValue)
		.orderBy(desc(countDistinct(products.id)))
		.limit(filter.pageSize)
		.where(and(...where))
		.offset((filter.page - 1) * filter.pageSize)

	const richCats = categoriesWithCounts.map(({ category, productCount }) => ({
		name: category,
		productCount,
	}))

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: countDistinct(eventTags.tagValue) })
		.from(eventTags)
		.innerJoin(products, eq(products.id, eventTags.eventId))
		.where(and(eq(eventTags.tagName, 't'), eq(products.banned, false), ...where))
		.execute()

	if (richCats.length > 0) {
		return { total, categories: richCats }
	} else {
		return { total: 0, categories: richCats }
	}
}
