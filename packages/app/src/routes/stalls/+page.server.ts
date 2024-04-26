import { getAllStalls } from '$lib/server/stalls.service'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	return {
		stalls: getAllStalls()
	}
}
