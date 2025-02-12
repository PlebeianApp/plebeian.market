import type { RequestHandler } from '@sveltejs/kit'
import { handleAppSettingsUpdate } from '$lib/appSettingshandler'

export const PUT: RequestHandler = handleAppSettingsUpdate(false)
