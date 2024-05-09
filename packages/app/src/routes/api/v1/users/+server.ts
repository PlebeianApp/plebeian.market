import { NDKKind } from '@nostr-dev-kit/ndk'
import { error, json } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service'
import { createUser, getAllUsers } from '$lib/server/users.service'

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
		const verifiedEvent = await verifyAndPersistRawEvent(request, NDKKind.Metadata)
		return json(await createUser(verifiedEvent))
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}
