import { getAllStalls } from '$lib/server/stalls.service'

export async function load() {
	return {
		stalls: await getAllStalls()
	}
}
