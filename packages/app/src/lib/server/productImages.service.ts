import { error } from '@sveltejs/kit'

import { db, eq, productImages } from '@plebeian/database'

export type ImagesForProduct = {
	mainImage: string
	galleryImages: string[]
}

export const getImagesByProductId = async (productId: string): Promise<ImagesForProduct> => {
	const productImagesResult = await db.select().from(productImages).where(eq(productImages.productId, productId)).execute()

	const images: ImagesForProduct = {
		mainImage: '',
		galleryImages: [],
	}

	productImagesResult.forEach((image) => {
		if (image.imageType === 'main' && image.imageUrl) {
			images.mainImage = image.imageUrl
		} else if (image.imageType === 'gallery' && image.imageUrl) {
			images.galleryImages.push(image.imageUrl)
		}
	})

	if (images) {
		return images
	}

	error(404, 'Not found')
}
