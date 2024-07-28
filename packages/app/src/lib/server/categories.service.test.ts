import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories } from '$lib/server/categories.service'
import { describe, expect, it } from 'vitest'

describe('categories service', () => {
	it('gets all categories', async () => {
		const { categories } = await getAllCategories()

		expect(categories.length).toBeGreaterThan(0)
	})

	it('gets all categories with filter', async () => {
		const filter: CatsFilter = catsFilterSchema.parse({})
		const { categories } = await getAllCategories(filter)

		expect(categories.length).toBeGreaterThan(0)
	})

	it('returns empty array when no categories found', async () => {
		const filter: CatsFilter = catsFilterSchema.parse({ category: 'Non-Existing Category' })
		const { categories } = await getAllCategories(filter)

		expect(categories).toEqual([])
	})
})
