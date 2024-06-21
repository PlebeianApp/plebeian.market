import type { PostProductImageFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'

import type { ProductImage } from '@plebeian/database'
import { and, auctions, count, db, eq, productImages, products } from '@plebeian/database'

export const getImagesByProductId = async (productId: string): Promise<ProductImage[]> => {
	const productImagesResult = await db.select().from(productImages).where(eq(productImages.productId, productId)).execute()
	if (productImagesResult) {
		return productImagesResult
	}

	error(404, 'Not found')
}

export const getImagesByUserId = async (userId: string): Promise<ProductImage[]> => {
	const auctionsRes = await db.select().from(auctions).where(eq(auctions.userId, userId)).execute()
	const productsRes = await db.select().from(products).where(eq(products.userId, userId)).execute()

	const auctionImagesResult = await Promise.all(
		auctionsRes.map((auction) => db.select().from(productImages).where(eq(productImages.auctionId, auction.id)).execute()),
	)
	const productImagesResult = await Promise.all(
		productsRes.map((product) => db.select().from(productImages).where(eq(productImages.productId, product.id)).execute()),
	)

	const combinedImages = [...auctionImagesResult, ...productImagesResult].flat()

	if (combinedImages) {
		return combinedImages
	}

	error(404, 'Not found')
}

export const editImage = async (productImage: { productId: string; imageOrder: number; imageUrl: string }): Promise<ProductImage> => {
	if (productImage.imageOrder === 0) {
		const allImages = await db.select().from(productImages).where(eq(productImages.productId, productImage.productId)).execute()

		await db.transaction(async (trx) => {
			for (const img of allImages) {
				await trx
					.update(productImages)
					.set({ imageOrder: img.imageOrder + 1 })
					.where(and(eq(productImages.productId, img.productId), eq(productImages.imageUrl, img.imageUrl)))
					.execute()
			}
		})
	}

	const [imageResult] = await db
		.update(productImages)
		.set({
			imageUrl: productImage.imageUrl,
			imageOrder: productImage.imageOrder,
		})
		.where(and(eq(productImages.productId, productImage.productId), eq(productImages.imageUrl, productImage.imageUrl)))
		.returning()
		.execute()

	if (imageResult) {
		await fixImageOrder(productImage.productId)
		return imageResult
	}

	throw error(500, 'Update failed')
}

export const addImageForProduct = async (productImage: PostProductImageFilter): Promise<ProductImage> => {
	const [productImageCount] = await db
		.select({ count: count() })
		.from(productImages)
		.where(eq(productImages.productId, productImage.productId))
		.execute()

	const [imageResult] = await db
		.insert(productImages)
		.values({
			productId: productImage.productId,
			imageUrl: productImage.imageUrl,
			imageOrder: productImageCount.count + 1,
		})
		.returning()
		.execute()

	await fixImageOrder(productImage.productId)
	return imageResult
}

export const removeImageForProduct = async (productId: string, imageUrl: string): Promise<ProductImage> => {
	const [imageResult] = await db
		.delete(productImages)
		.where(and(eq(productImages.productId, productId), eq(productImages.imageUrl, imageUrl)))
		.returning()
		.execute()

	await fixImageOrder(productId)
	return imageResult
}

const fixImageOrder = async (productId: string): Promise<void> => {
	const allImages = await db
		.select()
		.from(productImages)
		.where(eq(productImages.productId, productId))
		.orderBy(productImages.imageOrder)
		.execute()

	await db.transaction(async (trx) => {
		for (let i = 0; i < allImages.length; i++) {
			await trx
				.update(productImages)
				.set({ imageOrder: i })
				.where(and(eq(productImages.productId, allImages[i].productId), eq(productImages.imageUrl, allImages[i].imageUrl)))
				.execute()
		}
	})
}
