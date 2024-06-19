import { c as createQuery } from "./createQuery.js";
import { c as catsFilterSchema } from "./schema.js";
import { q as queryClient, c as createRequest } from "./client2.js";
const categoriesQuery = createQuery(
  {
    queryKey: ["categories"]
  },
  queryClient
);
const createCategoriesByFilterQuery = (filter) => createQuery(
  {
    queryKey: ["categories", ...Object.values(filter)],
    queryFn: async () => {
      const categories = await createRequest("GET /api/v1/category", {
        params: catsFilterSchema.parse(filter)
      });
      return categories;
    }
  },
  queryClient
);
export {
  categoriesQuery as a,
  createCategoriesByFilterQuery as c
};
