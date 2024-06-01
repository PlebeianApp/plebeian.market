import type { CatsFilter } from '$lib/schema'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories, getCategoriesByProductId } from '$lib/server/categories.service'
import { describe, expect, it } from 'vitest'

import { createId, devUser1 } from '@plebeian/database'

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
		const categories = await Promise.all(products.flatMap(({id}) => getCategoriesByProductId(id))) 
		// at least one of the products should have few categories
		expect(categories.length).toBeGreaterThan(0)
	})

	it('gets categories by user id', async () => {
		const userId = devUser1.pk
		const filter: CatsFilter = catsFilterSchema.parse({ userId: userId })
		const categories = await getAllCategories(filter)

		expect(categories.length).toBeGreaterThan(0)
	})

	it('returns empty array when no categories found', async () => {
		const filter: CatsFilter = catsFilterSchema.parse({ catName: 'Non-Existing Category' })
		const categories = await getAllCategories(filter)

		expect(categories).toEqual([])
	})

	it('returns 404 error when no categories found by product id', async () => {
		const productId = createId()
		const categories = await getCategoriesByProductId(productId)

		expect(categories).toEqual([])
	})
})
