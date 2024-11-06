import type { NostrEvent } from '@nostr-dev-kit/ndk'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts } from '$lib/constants'
import { productsFilterSchema } from '$lib/schema'
import { getStallsByUserId } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import type { Product } from '@plebeian/database'
import { createId, devUser1 } from '@plebeian/database'

import { getAllForbiddenWords } from './appSettings.service'
import {
	createProducts,
	getAllProducts,
	getProductById,
	getProductsByStallId,
	getProductsByUserId,
	toDisplayProduct,
	updateProduct,
} from './products.service'

describe('products service', () => {
	it('converts product to display product', async () => {
		const product: Product = {
			id: 'testProductId',
			updatedAt: new Date(),
			createdAt: new Date(),
			identifier: 'testIdentifier',
			userId: 'testUserId',
			stallId: 'testStallId',
			productName: 'testProductName',
			description: 'testDescription',
			price: 'testPrice',
			currency: 'testCurrency',
			quantity: 1,
			extraCost: '0',
			productType: 'simple',
			parentId: 'testParentId',
		}

		const displayProduct = await toDisplayProduct(product)

		expect(displayProduct).toEqual({
			createdAt: expect.any(String),
			id: 'testProductId',
			userId: 'testUserId',
			userNip05: null,
			identifier: 'testIdentifier',
			name: 'testProductName',
			isFeatured: expect.any(Boolean),
			description: 'testDescription',
			price: NaN,
			currency: 'testCurrency',
			quantity: 1,
			shipping: [],
			images: [],
			stallId: 'testStallId',
			categories: expect.any(Array),
		})
	})

	it('gets products by user id', async () => {
		const userId = devUser1.pk

		const { products } = await getProductsByUserId(productsFilterSchema.parse({ userId: userId }))

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets products by stall id', async () => {
		const userId = devUser1.pk

		const stalls = await getStallsByUserId(userId)

		expect(stalls.length).toBeGreaterThan(0)

		const { products } = await getProductsByStallId(stalls[0].id)

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets all products', async () => {
		const { products } = await getAllProducts()

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets product by id', async () => {
		const { products } = await getAllProducts()

		const product = await getProductById(products[0].id)

		expect(product).toBeDefined()
	})

	it('creates a product', async () => {
		await getAllForbiddenWords()
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const identifier = createId()
		const evContent = {
			stall_id: stall.id.split(':')[2],
			name: 'Hello Product',
			id: `${KindProducts}:${stall.userId}:${identifier}`,
			type: 'simple',
			description: 'Hello Description',
			images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
			currency: stall.currency,
			price: 133,
			quantity: 6,
			specs: [
				['color', 'red'],
				['size', 'medium'],
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: KindProducts,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()) / 1000,
			tags: [['d', identifier]],
		})
		await newEvent.sign(skSigner)
		const [product] = await createProducts([newEvent as NostrEvent])
		expect(product).toEqual({
			id: expect.any(String),
			createdAt: expect.any(String),
			currency: stall.currency,
			description: 'Hello Description',
			stallId: stall.id.split(':')[2],
			identifier: identifier,
			userId: devUser1.pk,
			userNip05: expect.any(String),
			images: expect.any(Array),
			isFeatured: expect.any(Boolean),
			name: 'Hello Product',
			price: 133,
			quantity: 6,
			shipping: [],
			categories: expect.any(Array),
		})
	})

	it('updates a product', async () => {
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const targetProduct = await getProductsByStallId(stall.id).then(({ products }) => products[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const evContent = {
			stall_id: stall.id.split(':')[2],
			name: 'Hello Product changed',
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			id: createId(),
			kind: KindProducts,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()) / 1000,
			tags: [['d', targetProduct.id.split(':')[2]]],
		})
		const product = await updateProduct(targetProduct.id, newEvent as NostrEvent)

		expect(product).toEqual({
			id: targetProduct.id,
			createdAt: expect.any(String),
			currency: targetProduct.currency,
			stallId: stall.id.split(':')[2],
			description: targetProduct.description,
			images: expect.any(Array),
			isFeatured: expect.any(Boolean),
			identifier: product?.identifier,
			name: 'Hello Product changed',
			userId: devUser1.pk,
			userNip05: expect.any(String),
			price: targetProduct.price,
			quantity: targetProduct.quantity,
			shipping: [],
			categories: expect.any(Array),
		})
	})
})
