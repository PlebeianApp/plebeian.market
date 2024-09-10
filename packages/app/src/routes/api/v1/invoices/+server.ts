import type { CreateInvoiceFilter, OrderFilter } from "$lib/schema";
import { createInvoice } from "$lib/server/invoices.service";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, url: { searchParams } }) => {
	try {
		const body = (await request.json()) as unknown as CreateInvoiceFilter
		return json(await createInvoice(body))
	} catch (e) {
		console.log(e)
		error(500, JSON.stringify(e))
	}
}
