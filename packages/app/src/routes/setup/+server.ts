import type { RequestHandler } from '@sveltejs/kit'
import { handleAppSettingsUpdate } from '$lib/appSettingshandler'

export const POST: RequestHandler = handleAppSettingsUpdate(true)
