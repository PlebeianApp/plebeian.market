import { getStallById } from '$lib/server/stalls.service'
import { getUserById } from '$lib/server/users.service.js'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const stallRes = getStallById(params.stallId)
	const userRes = getUserById(stallRes.userId)
	return {
		stall: stallRes,
		user: userRes
	}
}
