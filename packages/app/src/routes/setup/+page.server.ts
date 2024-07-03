import { INSTANCE_PASS } from '$env/static/private'
import { usersFilterSchema } from '$lib/schema'
import { getUsersByRole } from '$lib/server/users.service'

import { CURRENCIES, USER_ROLES } from '@plebeian/database/constants'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const currencies = CURRENCIES
	const adminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }))
	const instancePass = INSTANCE_PASS
	return { currencies, adminUsers, instancePass }
}
