import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'

import { and, count, countDistinct, db, desc, eq, eventTags, products, sql } from '@plebeian/database'

export type RichCat = {
	name: string
	productCount: number
}

export const getAllCategories = async (filter: CatsFilter = catsFilterSchema.parse({})) => {
	let query = db
		.select({
			category: eventTags.tagValue,
			productCount: countDistinct(products.id),
		})
		.from(eventTags)
		.where(eq(eventTags.tagName, 't'))
		.$dynamic()

	if (filter.userId) {
		query = query.where(eq(eventTags.userId, filter.userId))
	}
	if (filter.category) {
		query = query.where(eq(eventTags.tagValue, filter.category))
	}

	const categoriesWithCounts = await query
		.innerJoin(products, eq(products.id, eventTags.eventId))
		.groupBy(eventTags.tagValue)
		.orderBy(desc(countDistinct(products.id)))
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)

	const richCats = categoriesWithCounts.map(({ category, productCount }) => ({
		name: category,
		productCount,
	}))

	const [{ count: total } = { count: 0 }] = await db
		.select({ count: count() })
		.from(eventTags)
		.where(
			and(
				filter.userId ? eq(eventTags.userId, filter.userId) : undefined,
				eq(eventTags.tagName, 't'),
				filter.category ? eq(eventTags.tagValue, filter.category) : undefined,
			),
		)
		.groupBy(eventTags.tagValue)
		.execute()

	if (richCats.length > 0) {
		return { total, categories: richCats }
	} else {
		return { total: 0, categories: richCats }
	}
}
