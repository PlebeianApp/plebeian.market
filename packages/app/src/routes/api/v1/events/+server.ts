import { error, json } from '@sveltejs/kit'
import { eventsExists} from '$lib/server/nostrEvents.service.js'

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
