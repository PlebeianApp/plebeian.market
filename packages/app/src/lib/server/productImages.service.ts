import { error } from '@sveltejs/kit'

import { db, eq, productImages } from '@plebeian/database'

export const getImagesByProductId = async (productId: string): Promise<string[]> => {
	const productImagesResult = await db.select().from(productImages).where(eq(productImages.productId, productId)).execute()

	const galleryImages: string[] = []

	productImagesResult.forEach((image) => {
		if (image.imageUrl) {
			galleryImages.push(image.imageUrl)
		}
	})

	if (galleryImages) {
		return galleryImages
	}

	error(404, 'Not found')
}
