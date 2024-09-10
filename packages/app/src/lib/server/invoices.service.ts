import { authorize } from "$lib/auth";
import {
  createInvoiceFilter,
  CreateInvoiceFilter,
  updateInvoiceFilter,
  UpdateInvoiceFilter,
} from "$lib/schema";
import { db, eq, invoices, INVOICE_STATUS, orders } from "@plebeian/database";
import { error } from "@sveltejs/kit";

export const createInvoice = async (filter: CreateInvoiceFilter) => {
  const { data, success } = createInvoiceFilter.safeParse({
    ...filter,
  });
  if (!success) throw Error(`Invalid invoice data`);

  const [invoice] = await db
    .insert(invoices)
    .values({ ...data, invoiceStatus: INVOICE_STATUS.PENDING })
    .returning();

  return invoice;
};

export const updateInvoice = async (
  request: Request,
  invoiceId: string,
  filter: UpdateInvoiceFilter,
) => {
  const { data, success } = updateInvoiceFilter.safeParse({
    ...filter,
  });
  if (!success) throw Error(`Invalid invoice data`);

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId));

  const [{ buyerUserId }] = await db
    .select({
      buyerUserId: orders.buyerUserId,
    })
    .from(orders)
    .where(eq(orders.id, invoice.orderId));

  let authorized = false;

  try {
    await authorize(request, buyerUserId, "PUT");
    authorized = true;
  } catch {}

  if (!authorized) {
    throw error(
      401,
      "Only the merchant and the buyer can make modify the order",
    );
  }

  const [updatedInvoice] = await db
    .update(invoices)
    .set(data)
    .where(eq(invoices.id, invoiceId))
    .returning();

  return updatedInvoice;
};
