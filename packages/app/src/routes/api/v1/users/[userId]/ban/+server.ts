import { error, json } from '@sveltejs/kit'
import { authorizeEditorOrAdmin } from '$lib/auth'
import { setUserBanned } from '$lib/server/users.service'

export const POST = async ({ params, request }) => {
	const { userId } = params
	const { banned } = await request.json()

	if (typeof banned !== 'boolean') {
		throw error(400, 'Invalid request body')
	}

	try {
		await authorizeEditorOrAdmin(request, 'POST')
		const resultUserId = await setUserBanned(userId, banned)
		return json({ id: resultUserId })
	} catch (err) {
		throw error(500, `Failed to update user banned status: ${err.message}`)
	}
}
