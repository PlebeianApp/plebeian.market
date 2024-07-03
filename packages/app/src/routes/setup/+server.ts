import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'
import { initialSetupDataSchema } from '$lib/schema'
import { updateAppSettings } from '$lib/server/setup.service'

export const POST: RequestHandler = async ({ request }) => {
	const bodyRes = await request.json()
	if (bodyRes.adminsList) {
		bodyRes.adminsList = bodyRes.adminsList.toString().split(',')
	}
	bodyRes.isFirstTimeRunning = true
	const { data: parsedSetupData, success, error: zodError } = initialSetupDataSchema.safeParse(bodyRes)
	if (!success) throw Error(`${zodError}`)

	parsedSetupData.isFirstTimeRunning = true
	const setupRes = await updateAppSettings(parsedSetupData)
	return json(setupRes)
}
