import { error, json } from '@sveltejs/kit'
import { authorizeEditorOrAdmin } from '$lib/auth'
import { setStallBanned } from '$lib/server/stalls.service'

export const POST = async ({ params, request }) => {
	const { stallId } = params
	const { banned } = await request.json()

	if (typeof banned !== 'boolean') {
		throw error(400, 'Invalid request body')
	}

	try {
		await authorizeEditorOrAdmin(request, 'POST')
		const resultStallId = await setStallBanned(stallId, banned)
		return json({ id: resultStallId })
	} catch (err) {
		throw error(500, `Failed to update stall banned status: ${err.message}`)
	}
}
