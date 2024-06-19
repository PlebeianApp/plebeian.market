import { c as catsFilterSchema } from "../../../../chunks/schema.js";
const load = async ({ params }) => {
  const { catId } = params;
  return { filter: catsFilterSchema.parse({ catId }) };
};
export {
  load
};
