import type { OrderFilter, UpdateInvoiceFilter } from "$lib/schema";
import { updateInvoice } from "$lib/server/invoices.service";
import { createOrder, updateOrder } from "$lib/server/orders.service";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({
  request,
  params,
  url: { searchParams },
}) => {
  const { invoiceId } = params;
  try {
    const body = (await request.json()) as unknown as Partial<UpdateInvoiceFilter>;
    return json(await updateInvoice(request, invoiceId, body));
  } catch (e) {
    console.log(e);
    error(500, JSON.stringify(e));
  }
};
