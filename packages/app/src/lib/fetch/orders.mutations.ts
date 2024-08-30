import type { OrderFilter } from "$lib/schema";
import { createMutation } from "@tanstack/svelte-query";
import { createRequest, queryClient } from './client'

declare module "./client" {
  interface Endpoints {
    "POST /api/v1/orders": Operation<
      string,
      "POST",
      never,
      OrderFilter,
      never,
      never
    >;
  }
}

export const createOrderMutation = createMutation(
  {
    mutationKey: [],
    mutationFn: async (orderFilter: OrderFilter) => {
      await createRequest(`POST /api/v1/orders`, {
        auth: true,
        body: orderFilter,
      });
    },
  },
  queryClient,
);
