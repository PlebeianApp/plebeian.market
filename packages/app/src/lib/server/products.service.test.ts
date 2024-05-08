import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts } from '$lib/constants'
import { getStallsByUserId } from '$lib/server/stalls.service'
import { slugify } from '$lib/utils'
import { describe, expect, it } from 'vitest'

import type { Product } from '@plebeian/database'
import { createId, devUser1 } from '@plebeian/database'

import {
	createProduct,
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
			stockQty: 1,
			extraCost: '0',
			productType: 'testProductType',
			parentId: 'testParentId',
		}

		const displayProduct = await toDisplayProduct(product)

		expect(displayProduct).toEqual({
			createdAt: expect.any(String),
			id: 'testProductId',
			name: 'testProductName',
			description: 'testDescription',
			price: NaN,
			currency: 'testCurrency',
			stockQty: 1,
			mainImage: '',
			galleryImages: [],
		})
	})

	it('gets products by user id', async () => {
		const userId = devUser1.pk

		const products = await getProductsByUserId(userId)

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets products by stall id', async () => {
		const userId = devUser1.pk

		const stalls = await getStallsByUserId(userId)

		expect(stalls.length).toBeGreaterThan(0)

		const products = await getProductsByStallId(stalls[0].id)

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets all products', async () => {
		const products = await getAllProducts()

		expect(products.length).toBeGreaterThan(0)
	})

	it('gets product by id', async () => {
		const products = await getAllProducts()

		const product = await getProductById(products[0].id)

		expect(product).toBeDefined()
	})

	it('creates a product', async () => {
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const identifier = createId()
		const evContent = {
			stall_id: stall.id,
			name: 'Hello Product',
			id: `${KindProducts}:${stall.userId}:${identifier}`,
			type: 'simple',
			description: 'Hello Description',
			images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
			currency: 'USD',
			price: 133,
			quantity: 6,
			specs: [
				['color', 'red'],
				['size', 'medium'],
			],
			shipping: [
				{
					id: Math.random().toString(36).substring(2, 15),
					cost: Math.random() * 10,
				},
			],
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: 30018 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [['d', `${slugify(evContent.name)}${createId()}`]],
		})
		await newEvent.sign(skSigner)
		const product = await createProduct(newEvent)
		expect(product).toStrictEqual({
			id: expect.any(String),
			createdAt: expect.any(String),
			currency: 'USD',
			description: 'Hello Description',
			galleryImages: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
			mainImage: '',
			name: 'Hello Product',
			price: 133,
			stockQty: 6,
		})
	})

	it('updates a product', async () => {
		const stall = await getStallsByUserId(devUser1.pk).then((stalls) => stalls[0])
		const targetProduct = await getProductsByStallId(stall.id).then((products) => products[0])
		const skSigner = new NDKPrivateKeySigner(devUser1.sk)
		const evContent = {
			stall_id: stall.id,
			name: 'Hello Product changed',
		}
		const newEvent = new NDKEvent(new NDK({ signer: skSigner }), {
			kind: 30018 as NDKKind,
			pubkey: devUser1.pk,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now() / 1000),
			tags: [['d', `${slugify(evContent.name)}${createId()}`]],
		})

		const product = await updateProduct(targetProduct.id, newEvent)

		expect(product).toStrictEqual({
			id: targetProduct.id,
			createdAt: expect.any(String),
			currency: targetProduct.currency,
			description: targetProduct.description,
			galleryImages: expect.any(Array),
			mainImage: expect.any(String),
			name: 'Hello Product changed',
			price: targetProduct.price,
			stockQty: targetProduct.stockQty,
		})
	})
})
