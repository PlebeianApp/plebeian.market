import { getAllProducts } from '$lib/server/products.service'
import { describe, expect, it } from 'vitest'

describe('/categories', () => {
	it('GET', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/category`).then((response) => response.json())

		expect(result.categories.length).toBeGreaterThan(0)
	})

	it('GET with filter', async () => {
		const routeParams = {
			pageSize: '5',
		}

		const result = await fetch(
			`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/category?${new URLSearchParams(routeParams)}`,
		).then((response) => response.json())

		expect(result.categories.length).toBeGreaterThan(0)
	})

	it('GET categories by product id', async () => {
		const productId = await getAllProducts().then(({ products }) => products[0].id)
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/category?productId=${productId}`).then(
			(response) => response.json(),
		)

		expect(result.categories.length).toBeTruthy()
	})
})
