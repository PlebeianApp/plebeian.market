import { c as createQuery } from "./createQuery.js";
import { p as productsFilterSchema } from "./schema.js";
import { h as currencyToBtc } from "./utils2.js";
import { q as queryClient, c as createRequest } from "./client2.js";
const createProductPriceQuery = (product) => createQuery(
  {
    queryKey: ["products", "price", product.id],
    queryFn: async () => {
      return await currencyToBtc(product.currency, product.price, true);
    }
  },
  queryClient
);
const createProductsByFilterQuery = (filter) => createQuery(
  {
    queryKey: ["products", ...Object.values(filter)],
    queryFn: async () => {
      const products = await createRequest("GET /api/v1/products", {
        params: productsFilterSchema.parse(filter)
      });
      return products;
    }
  },
  queryClient
);
export {
  createProductPriceQuery as a,
  createProductsByFilterQuery as c
};
