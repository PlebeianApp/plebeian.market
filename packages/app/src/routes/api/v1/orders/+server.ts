import { createOrder } from "$lib/server/orders.service";
import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { error, json, type RequestHandler } from "@sveltejs/kit";


export const POST: RequestHandler = async ({ request, url: { searchParams } }) => {
	try {
		const body = (await request.json()) as unknown as NostrEvent
		return json(await createOrder(body))
	} catch (e) {
		console.log(e)
		error(500, JSON.stringify(e))
	}
}