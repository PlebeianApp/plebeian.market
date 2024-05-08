import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { stallsFilterSchema } from '$lib/schema'
import { createStall, getAllStalls } from '$lib/server/stalls.service'
import { verifyEvent } from 'nostr-tools'

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
	const body = await request.json()
	const verifiedEvent = n
		.event()
		.refine(verifyEvent)
		.refine((val) => val.kind === KindStalls)
		.safeParse(body)

	if (!verifiedEvent.success) {
		return error(400, `Invalid request: ${JSON.stringify(verifiedEvent.error)}`)
	} else {
		return json(await createStall(verifiedEvent.data))
	}
}
