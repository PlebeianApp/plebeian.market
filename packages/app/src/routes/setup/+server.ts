import { error, json } from '@sveltejs/kit'
import { initialSetupDataSchema } from '$lib/schema'
import { doSetup } from '$lib/server/setup.service'

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const bodyRes = await request.json()

	console.log('Setup request', bodyRes)

	const parsedSetupData = initialSetupDataSchema.safeParse(bodyRes)

	if (!parsedSetupData.success) {
		console.error('Invalid request', parsedSetupData.error)
		error(400, parsedSetupData.error)
	}

	const setupRes = await doSetup(bodyRes)
	console.log('Setup response', setupRes)
	return json(setupRes)
}

// redirect dummy
export async function GET({ request }) {}
