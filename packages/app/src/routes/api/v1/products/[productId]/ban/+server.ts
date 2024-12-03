import { error, json } from '@sveltejs/kit'
import { authorizeEditorOrAdmin } from '$lib/auth'
import { setProductBanned } from '$lib/server/products.service'

export const POST = async ({ params, request }) => {
	const { productId } = params
	const { banned } = await request.json()

	if (typeof banned !== 'boolean') {
		throw error(400, 'Invalid request body')
	}

	try {
		await authorizeEditorOrAdmin(request, 'POST')
		const resultProductId = await setProductBanned(productId, banned)
		return json({ id: resultProductId })
	} catch (err) {
		throw error(500, `Failed to update product banned status: ${err}`)
	}
}
