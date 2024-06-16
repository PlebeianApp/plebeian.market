import type { RequestHandler } from '@sveltejs/kit'
import { error, json } from '@sveltejs/kit'
import { initialSetupDataSchema } from '$lib/schema'
import { doSetup } from '$lib/server/setup.service'

export const POST: RequestHandler = async ({ request }) => {
	const bodyRes = await request.json()
	if (bodyRes.adminsList) {
		bodyRes.adminsList = bodyRes.adminsList.toString().split(',')
	}

	const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes)
	if (!parsedSetupData.success) {
		error(400, parsedSetupData.error)
	}
	const setupRes = await doSetup(bodyRes, parsedSetupData.data.adminsList)
	return json(setupRes)
}
