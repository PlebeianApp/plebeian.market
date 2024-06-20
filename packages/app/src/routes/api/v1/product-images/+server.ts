import { error, json } from '@sveltejs/kit'
import { authorize, authorizeUserless } from '$lib/auth'
import { editImage, getImagesByUserId } from '$lib/server/productImages.service'
import { getProductById } from '$lib/server/products.service'
import { z } from 'zod'

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

export async function PUT({ request }) {
	const body = await request.json()

	const productImage = z
		.object({
			productId: z.string(),
			imageOrder: z.number(),
			imageUrl: z.string(),
		})
		.safeParse(body)

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

	console.log('productImage', productImage.data)

	return json(await editImage(productImage.data))
}
