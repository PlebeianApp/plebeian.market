import { NDKKind } from '@nostr-dev-kit/ndk'
import { NSchema as n } from '@nostrify/nostrify'
import { error, json } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { createUser, getAllUsers } from '$lib/server/users.service'
import { verifyEvent } from 'nostr-tools'

export const GET = async ({ url: { searchParams } }) => {
	const spObj = Object.fromEntries(searchParams)
	const filter = usersFilterSchema.safeParse(spObj)

	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		return json(await getAllUsers(filter.data))
	}
}

export const POST = async ({ request }) => {
	try {
		const body = await request.json()
		const verifiedEvent = n
			.event()
			.refine(verifyEvent)
			.refine((val) => val.kind === NDKKind.Metadata)
			.safeParse(body)
		if (!verifiedEvent.success) {
			error(400, `Invalid nostr Event: ${JSON.stringify(verifiedEvent.error)}`)
		}
		return json(await createUser(verifiedEvent.data))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}
