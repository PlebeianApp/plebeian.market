import type { OrderFilter } from "$lib/schema";
import type { Order } from "@plebeian/database";
import { createMutation } from "@tanstack/svelte-query";
import { createRequest, queryClient } from "./client";

declare module "./client" {
  interface Endpoints {
    "POST /api/v1/orders": Operation<
      string,
      "POST",
      never,
      OrderFilter,
      Order,
      never
    >;
    [k: `PUT /api/v1/orders/${string}`]: Operation<
      string,
      "PUT",
      never,
      Partial<OrderFilter>,
      Order,
      never
    >;
  }
}

export const createOrderMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async (orderFilter: OrderFilter) => {
      return createRequest(`POST /api/v1/orders`, {
        auth: true,
        body: orderFilter,
      });
    },
  },
  queryClient,
);

export const updateOrderMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async ([orderId, orderFilter]: [string, Partial<OrderFilter>]) => {
      return createRequest(`PUT /api/v1/orders/${orderId}`, {
        auth: true,
        body: orderFilter,
      });
    },
  },
  queryClient,
);
