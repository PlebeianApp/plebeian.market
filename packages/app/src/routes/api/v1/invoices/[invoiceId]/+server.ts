import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getInvoiceById, updateInvoiceStatus } from '$lib/server/invoices.service'

export const GET = async ({ request, params, locals }) => {
	const userId = await authorizeUserless(request, 'POST')
	if (!userId) {
		error(401, 'Unauthorized')
	}

	const invoice = await getInvoiceById(params.invoiceId)
	return json(invoice)
}

export const PUT = async ({ params, request, locals }) => {
	const userId = await authorizeUserless(request, 'PUT')
	if (!userId) {
		error(401, 'Unauthorized')
	}

	const body = await request.json()
	const { status } = body

	if (!status) {
		error(400, 'Status is required')
	}

	const updatedInvoice = await updateInvoiceStatus(params.invoiceId, status, userId)
	return json(updatedInvoice)
}
