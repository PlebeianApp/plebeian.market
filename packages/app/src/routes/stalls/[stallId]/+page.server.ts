import { getStallById } from '$lib/server/stalls.service'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	return {
		stall: getStallById(params.stallId)
	}
}
