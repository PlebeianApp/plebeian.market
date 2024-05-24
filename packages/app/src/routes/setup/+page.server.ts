import { popularCurrencies } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const currencies = popularCurrencies
	return { currencies }
}
