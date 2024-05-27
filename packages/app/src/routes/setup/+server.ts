import { error, json } from '@sveltejs/kit'
import { initialSetupDataSchema } from '$lib/schema'
import { doSetup } from '$lib/server/setup.service'

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const bodyRes = await request.json()
	if (bodyRes.adminsList) {
		bodyRes.adminsList = bodyRes.adminsList.toString().split(',')
	}
	bodyRes.allowRegister = Boolean(bodyRes.allowRegister)

	const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes)

	if (!parsedSetupData.success) {
		error(400, parsedSetupData.error)
	}
	const setupRes = await doSetup(bodyRes, parsedSetupData.data.adminsList)
	return json(setupRes)
}
