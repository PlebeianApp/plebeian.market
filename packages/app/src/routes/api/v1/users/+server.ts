import { error, json } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { createUser, getAllUsers } from '$lib/server/users.service'

export const GET = async ({ url: { searchParams } }) => {
	const spObj = Object.fromEntries(searchParams)
	const filter = usersFilterSchema.safeParse(spObj)

	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		return json(await getAllUsers(filter.data))
	}
}

export const POST = async ({ request }) => {
	try {
		const body = await request.json()
		return json(await createUser(body))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}
