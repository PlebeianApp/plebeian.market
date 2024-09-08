import type { OrderFilter } from "$lib/schema";
import { createOrder, updateOrder } from "$lib/server/orders.service";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({
  request,
  params,
  url: { searchParams },
}) => {
  const { orderId } = params;
  try {
    const body = (await request.json()) as unknown as Partial<OrderFilter>;
    return json(await updateOrder(request, orderId, body));
  } catch (e) {
    console.log(e);
    error(500, JSON.stringify(e));
  }
};
