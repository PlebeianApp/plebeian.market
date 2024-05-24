// import { browser } from '$app/env'
import { isInitialSetup } from '$lib/server/setup.service'

export const fetchSetupStatus = async (): Promise<boolean> => {
	const response = await isInitialSetup()
	return response
}
