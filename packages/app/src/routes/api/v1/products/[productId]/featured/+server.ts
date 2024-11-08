import { error, json } from '@sveltejs/kit'
import { authorizeEditorOrAdmin } from '$lib/auth'
import { setProductMetaFeatured } from '$lib/server/products.service'

export const POST = async ({ params, request }) => {
	const { productId } = params
	const { featured } = await request.json()

	if (typeof featured !== 'boolean') {
		throw error(400, 'Invalid request body')
	}

	try {
		await authorizeEditorOrAdmin(request, 'POST')
		const resultProductId = await setProductMetaFeatured(productId, featured)
		console.log('setProductFeatured', resultProductId)
		return json({ id: resultProductId })
	} catch (err) {
		throw error(500, `Failed to update product featured status: ${err.message}`)
	}
}
