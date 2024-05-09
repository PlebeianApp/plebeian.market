import { error, json } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { stallsFilterSchema } from '$lib/schema'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { createStall, getAllStalls } from '$lib/server/stalls.service'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = stallsFilterSchema.safeParse(spObj)

	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		return json(await getAllStalls(filter.data))
	}
}

export async function POST({ request }) {
	try {
		const verifiedEvent = await verifyAndPersistRawEvent(request, KindStalls)
		return json(await createStall(verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}
