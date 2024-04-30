import { db, eq, productImages } from '@plebeian/database'
import { error } from '@sveltejs/kit'

export type ImagesForProduct = {
	mainImage: string
	galleryImages: string[]
}

export const getImagesByProductId = (productId: string): ImagesForProduct => {
	const productImagesResult = db
		.select()
		.from(productImages)
		.where(eq(productImages.productId, productId))
		.all()

	let images: ImagesForProduct = {
		mainImage: '',
		galleryImages: []
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
