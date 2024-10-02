import { error, json } from '@sveltejs/kit'
import { authorizeUserless } from '$lib/auth'
import { getInvoiceById, updateInvoiceObservations, updateInvoiceStatus } from '$lib/server/invoices.service'

export const GET = async ({ request, params }) => {
	const userId = await authorizeUserless(request, 'POST')
	if (!userId) {
		error(401, 'Unauthorized')
	}

	const invoice = await getInvoiceById(params.invoiceId)
	return json(invoice)
}

export const PUT = async ({ params, request }) => {
	const userId = await authorizeUserless(request, 'PUT')
	if (!userId) {
		error(401, 'Unauthorized')
	}

	const body = await request.json()
	const { status, observations } = body

	if (!status && !observations) {
		error(400, 'Status is required')
	}

	if (status && observations) {
		error(400, 'Cannot update status and observations at the same time')
	}

	if (observations) {
		const updatedInvoice = await updateInvoiceObservations(params.invoiceId, observations, userId)
		return json(updatedInvoice)
	} else {
		const updatedInvoice = await updateInvoiceStatus(params.invoiceId, status, userId)
		return json(updatedInvoice)
	}
}
