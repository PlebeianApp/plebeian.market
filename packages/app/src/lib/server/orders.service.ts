import { OrderFilter, orderSchema } from "$lib/schema";
import { createId } from "@plebeian/database";

export const createOrder = async (orderFilter: OrderFilter) => {
  const { data, success } = orderSchema.safeParse({
    id: createId(),
    ...orderFilter,
  });
  console.log(data, success);

  if (!success) throw Error(`Invalid stall event data`);
};
