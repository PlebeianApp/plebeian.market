import { error, json } from '@sveltejs/kit'
import { authorize, authorizeUserless } from '$lib/auth'
import { postProductImageSchema } from '$lib/schema'
import { addImageForProduct, editImage, getImagesByUserId, removeImageForProduct } from '$lib/server/productImages.service'
import { getProductById } from '$lib/server/products.service'

export async function GET({ request, url: { searchParams } }) {
	const userId = searchParams.get('userId')

	if (!userId) {
		error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'GET')
		return json(await getImagesByUserId(userId))
	} catch (e) {
		if (e.status) {
			error(e.status, e.message)
		}
		error(500, JSON.stringify(e))
	}
}

export async function POST({ params, request }) {
	const body = await request.json()

	const productImage = postProductImageSchema.safeParse(body)

	if (!productImage.success) {
		return error(400, `Invalid request: ${JSON.stringify(productImage.error)}`)
	}

	try {
		const userId = await authorizeUserless(request, 'POST')
		const product = await getProductById(productImage.data.productId)

		if (product.userId !== userId) {
			error(401, 'Unauthorized')
		}
	} catch (e) {
		error(401, 'Unauthorized')
	}

	return json(await addImageForProduct(productImage.data))
}

export async function PUT({ request }) {
	const body = await request.json()

	const productImage = postProductImageSchema.safeParse(body)

	if (!productImage.success) {
		return error(400, `Invalid request: ${JSON.stringify(productImage.error)}`)
	}

	try {
		const userId = await authorizeUserless(request, 'PUT')
		const product = await getProductById(productImage.data.productId)

		if (product.userId !== userId) {
			error(401, 'Unauthorized')
		}
	} catch (e) {
		error(401, 'Unauthorized')
	}

	return json(await editImage(productImage.data))
}

export async function DELETE({ request, url: { searchParams } }) {
	const imageUrl = searchParams.get('imageUrl')
	const productId = searchParams.get('productId')

	if (!imageUrl || !productId) {
		error(400, 'Invalid request')
	}

	try {
		const userId = await authorizeUserless(request, 'DELETE')
		const product = await getProductById(productId)

		if (product.userId !== userId) {
			error(401, 'Unauthorized')
		}
	} catch (e) {
		error(401, 'Unauthorized')
	}

	const productImages = await removeImageForProduct(productId, imageUrl)
	return json(productImages)
}
