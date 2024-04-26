import { json } from '@sveltejs/kit'
import { getStallById } from '$lib/server/stalls.service'

/** @type {import('./$types').RequestHandler} */
export function GET({ params }) {
	return json(getStallById(params.stallId))
}
