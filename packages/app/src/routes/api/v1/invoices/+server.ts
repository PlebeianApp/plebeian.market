import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { invoicesFilterSchema } from '$lib/schema'
import { createInvoice, getInvoicesByOrderId } from '$lib/server/invoices.service'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = invoicesFilterSchema.safeParse(spObj)

	if (!filter.success) {
		error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else if (filter.data.orderId) {
		return json(await getInvoicesByOrderId(filter.data))
	}
}

export const POST = async ({ request }) => {
	const orderData = await request.json()

	try {
		const userId = await authorizeUserless(request, 'POST')
		const newInvoice = await createInvoice({
			...orderData,
			sellerUserId: userId,
			buyerUserId: orderData.buyerUserId,
		})
		return json(newInvoice)
	} catch (err) {
		throw error(401, 'Unauthorized')
	}
}
