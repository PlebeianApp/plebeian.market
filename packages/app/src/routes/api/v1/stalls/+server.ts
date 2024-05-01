import { json } from '@sveltejs/kit'
import { getAllStalls } from '$lib/server/stalls.service'

export async function GET() {
	return json(await getAllStalls())
}
