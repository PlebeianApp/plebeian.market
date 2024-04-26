import { json } from '@sveltejs/kit'
import { getAllStalls } from '$lib/server/stalls.service'

/** @type {import('./$types').RequestHandler} */
export function GET({ params }) {
	return json(getAllStalls())
}
