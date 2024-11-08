import { error, json } from '@sveltejs/kit'
import { authorizeEditorOrAdmin } from '$lib/auth.js'
import { setStallMetaFeatured } from '$lib/server/stalls.service'
import { string } from 'zod'

export const POST = async ({ params, request }) => {
	const { stallId } = params
	const { featured } = await request.json()

	if (typeof featured !== 'boolean') {
		throw error(400, 'Invalid request body')
	}

	try {
		await authorizeEditorOrAdmin(request, 'POST')
		const resultStallId = await setStallMetaFeatured(stallId, featured)
		return json({ id: resultStallId })
	} catch (err) {
		throw error(500, `Failed to update stall featured status: ${err.message}`)
	}
}
