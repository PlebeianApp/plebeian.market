import { getAllProducts } from '$lib/server/products.service'
import { getAllStalls } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import { devUser1 } from '@plebeian/database'

describe('/products', () => {
	it('GET', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/products`).then((response) => response.json())

		expect(result).toHaveLength(10)
	})

	it('GET', async () => {
		const routeParams = {
			page: '1',
			pageSize: '15',
			order: 'desc',
			orderBy: 'price',
		}

		const result = await fetch(
			`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/products?${new URLSearchParams(routeParams)}`,
		).then((response) => response.json())

		expect(result).toHaveLength(15)
	})

	it('POST', async () => {
		const stallId = await getAllStalls().then((stalls) => stalls[0].id)
		const parentId = await getAllProducts().then((products) => products[0].id)
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/products`, {
			method: 'POST',
			body: JSON.stringify({
				userId: devUser1.pk,
				stallId: stallId,
				productName: 'testProductName',
				description: 'testDescription',
				price: '16',
				currency: 'USD',
				stockQty: 1,
				productType: 'simple',
				parentId: parentId,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => response.json())

		expect(result).toStrictEqual({
			id: expect.any(String),
			createdAt: expect.any(String),
			name: 'testProductName',
			description: 'testDescription',
			price: 16,
			currency: 'USD',
			stockQty: 1,
			mainImage: '',
			galleryImages: [],
		})
	})

	it('GET products by user id', async () => {
		const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/products?userId=testUserId`).then(
			(response) => response.json(),
		)

		expect(result).toHaveLength(10)
	})
})
