import type { RequestHandler } from '@sveltejs/kit'
import type { ExtendedAppSettings } from '$lib/server/setup.service'
import { error, json } from '@sveltejs/kit'
import { initialSetupDataSchema } from '$lib/schema'
import { updateAppSettings } from '$lib/server/setup.service'

export const PUT: RequestHandler = async ({ request }) => {
	const bodyRes = await request.json()
	if (bodyRes.adminsList) {
		bodyRes.adminsList = bodyRes.adminsList.toString().split(',')
	}
	bodyRes.allowRegister = JSON.parse(bodyRes.allowRegister)
	const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes)
	if (!parsedSetupData.success) {
		error(400, parsedSetupData.error)
	}
	const setupRes = await updateAppSettings(parsedSetupData.data as ExtendedAppSettings)
	return json(setupRes)
}
