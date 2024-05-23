import { popularCurrencies } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const currencies = popularCurrencies
	return { currencies }
}

export const actions = {
	submitSetupData: async ({ request }) => {
		const formData = await request.formData()

		console.log('submitSetupData', formData)
	},
}
