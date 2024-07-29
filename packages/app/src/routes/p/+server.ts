import { error, json } from '@sveltejs/kit'
import { ensureAuthorExists } from '$lib/server/nostrEvents.service.js'

export const POST = async ({ request }) => {
	try {
		const body = await request.json()
		return json(await ensureAuthorExists(body.userId))
	} catch (e) {
		console.log('e', e)
		error(500, JSON.stringify(e))
	}
}
