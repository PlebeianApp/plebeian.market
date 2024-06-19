import { j as json } from "../../../../../../chunks/index.js";
import { c as catsFilterSchema } from "../../../../../../chunks/schema.js";
import { g as getAllCategories } from "../../../../../../chunks/categories.service.js";
const GET = async ({ params }) => {
  const [cat] = await getAllCategories(catsFilterSchema.parse({ catId: params.catId }));
  return json(cat);
};
export {
  GET
};
