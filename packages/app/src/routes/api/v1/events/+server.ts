import { error, json } from '@sveltejs/kit'
import { KindProducts, KindStalls } from '$lib/constants.js'
import { eventsExists, persistEvent, verifyAndPersistRawEvent } from '$lib/server/nostrEvents.service.js'
import { createProduct } from '$lib/server/products.service.js'
import { createStall } from '$lib/server/stalls.service.js'

export async function POST({ request }) {
	try {
		const events = await request.json()
		// console.log("Persisting event", events)
		const verifiedEvent = await eventsExists(events, true)
		// if (verifiedEvent.kind == KindProducts) {
		//     console.log("Its kind products, creating ...")
		//     result = await createProduct(verifiedEvent)
		// } else if (verifiedEvent.kind == KindStalls) {
		//     console.log("It's kind stalls, creating ...")
		//     result = await createStall(verifiedEvent)
		// }
		// return json(result)
		return json(verifiedEvent)
	} catch (e) {
		error(500, JSON.stringify(e))
	}
}
