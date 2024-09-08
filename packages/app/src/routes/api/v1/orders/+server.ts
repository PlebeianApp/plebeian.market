import type { OrderFilter } from "$lib/schema";
import { createOrder } from "$lib/server/orders.service";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, url: { searchParams } }) => {
	try {
		const body = (await request.json()) as unknown as OrderFilter
		return json(await createOrder(body))
	} catch (e) {
		console.log(e)
		error(500, JSON.stringify(e))
	}
}
