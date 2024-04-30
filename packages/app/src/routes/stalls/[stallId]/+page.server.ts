import { getStallById } from '$lib/server/stalls.service'
import { getUserById } from '$lib/server/users.service.js'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const stallRes = await getStallById(params.stallId)
	const userRes = await getUserById(stallRes.userId)
	return {
		stall: stallRes,
		user: userRes
	}
}
