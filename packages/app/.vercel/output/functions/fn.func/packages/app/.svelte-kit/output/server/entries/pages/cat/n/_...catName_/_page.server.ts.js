import { c as catsFilterSchema } from "../../../../../chunks/schema.js";
import { l as getStallsByCatName } from "../../../../../chunks/products.service.js";
const load = async ({ params }) => {
  const { catName } = params;
  const stalls = await getStallsByCatName(catName);
  return {
    filter: catsFilterSchema.parse({ catName }),
    stalls
  };
};
export {
  load
};
