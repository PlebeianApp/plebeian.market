import { error } from '@sveltejs/kit'

import { db, eq, productImages } from '@plebeian/database'

export const getImagesByProductId = async (productId: string): Promise<string[]> => {
	const productImagesResult = await db.select().from(productImages).where(eq(productImages.productId, productId)).execute()

	const images: string[] = []

	productImagesResult.forEach((image) => {
		if (image.imageUrl) {
			images.push(image.imageUrl)
		}
	})

	if (images) {
		return images
	}

	error(404, 'Not found')
}
