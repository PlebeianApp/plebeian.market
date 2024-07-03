import { usersFilterSchema } from '$lib/schema'
import { getUsersByRole } from '$lib/server/users.service'
import dotenv from 'dotenv'

import { CURRENCIES, USER_ROLES } from '@plebeian/database/constants'

import type { PageServerLoad } from './$types'

dotenv.config({
	path: '../../.env',
})

export const load: PageServerLoad = async () => {
	const currencies = CURRENCIES
	const adminUsers = await getUsersByRole(usersFilterSchema.parse({ role: USER_ROLES.ADMIN }))
	const instancePass = process.env.INSTANCE_PASS
	return { currencies, adminUsers, instancePass }
}
