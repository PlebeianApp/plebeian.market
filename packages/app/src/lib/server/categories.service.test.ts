import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories, getCategoriesByProductId } from '$lib/server/categories.service'
import { describe, expect, it } from 'vitest'

import { createId, db } from '@plebeian/database'

import { getAllProducts } from './products.service'

describe('categories service', () => {
	it('gets all categories', async () => {
		const categories = await getAllCategories()

		expect(categories.length).toBeGreaterThan(0)
	})

	it('gets all categories with filter', async () => {
		const filter: CatsFilter = catsFilterSchema.parse({})
		const categories = await getAllCategories(filter)

		expect(categories.length).toBeGreaterThan(0)
	})

	it('gets categories by product id', async () => {
		const products = await getAllProducts()
		const categories = await Promise.all(products.flatMap(({ id }) => getCategoriesByProductId(id)))

		expect(categories.length).toBeGreaterThan(0)
	})

	it('gets categories by user id', async () => {
		const prodCat = await db.query.productCategories.findFirst()
		const filter: CatsFilter = catsFilterSchema.parse({ userId: prodCat?.productId?.split(':')[1] })
		const categories = await getAllCategories(filter)
		expect(categories.length).toBeGreaterThan(0)
	})

	it('returns empty array when no categories found', async () => {
		const filter: CatsFilter = catsFilterSchema.parse({ category: 'Non-Existing Category' })
		const categories = await getAllCategories(filter)

		expect(categories).toEqual([])
	})

	it('returns 404 error when no categories found by product id', async () => {
		const productId = createId()
		const categories = await getCategoriesByProductId(productId)

		expect(categories).toEqual([])
	})
})
