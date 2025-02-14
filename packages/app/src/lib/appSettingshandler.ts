import type { RequestHandler } from '@sveltejs/kit'
import type { ExtendedAppSettings } from '$lib/server/setup.service'
import { error, json } from '@sveltejs/kit'
import { updateAppSettings } from '$lib/server/setup.service'

import { authorizeAdmin } from './auth'
import { initialSetupDataSchema } from './schema'

export const handleAppSettingsUpdate = (isSetup: boolean): RequestHandler => {
	return async ({ request }) => {
		await authorizeAdmin(request, 'PUT')
		const bodyRes = await request.json()
		if (bodyRes.adminsList) {
			bodyRes.adminsList = bodyRes.adminsList.toString().split(',')
		}

		if (!isSetup) {
			bodyRes.allowRegister = JSON.parse(bodyRes.allowRegister)
		}

		bodyRes.isFirstTimeRunning = isSetup

		const schema = isSetup ? initialSetupDataSchema : initialSetupDataSchema.partial()
		const parsedData = schema.safeParse(bodyRes)

		if (!parsedData.success) {
			return error(400, { message: JSON.stringify(parsedData.error.errors) })
		}

		const setupRes = await updateAppSettings(parsedData.data as ExtendedAppSettings)
		return json(setupRes)
	}
}
