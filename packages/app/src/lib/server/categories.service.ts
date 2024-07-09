import type { CatsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'

import { and, db, eq, EventTag, eventTags, products, sql } from '@plebeian/database'

export type RichCat = {
	name: string
	productCount: number
}

const resolveCategory = async (tag: EventTag): Promise<RichCat> => {
	const [productCount] = (
		await db
			.select({
				count: sql<number>`cast(count(${products.id}) as int)`,
			})
			.from(eventTags)
			.where(and(eq(eventTags.tagValue, tag.tagValue), eq(eventTags.tagName, 't')))
			.innerJoin(products, eq(products.eventId, eventTags.eventId))
			.execute()
	).map((product) => product.count)

	return {
		name: tag.tagValue,
		productCount: productCount,
	}
}

export const getAllCategories = async (filter: CatsFilter = catsFilterSchema.parse({})): Promise<RichCat[]> => {
	const result = await db
		.select()
		.from(eventTags)
		.where(
			and(
				filter.userId ? eq(eventTags.userId, filter.userId) : undefined,
				eq(eventTags.tagName, 't'),
				filter.category ? eq(eventTags.tagValue, filter.category) : undefined,
			),
		)
		.groupBy(eventTags.tagValue)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)

	const richCats = await Promise.all(
		result.map(async (cat) => {
			return await resolveCategory(cat)
		}),
	)

	if (richCats) {
		return richCats
	}

	error(404, { message: `No categories found` })
}
