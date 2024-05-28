import { CURRENCIES } from '@plebeian/database/constants'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const currencies = CURRENCIES
	return { currencies }
}
