import { e as error, j as json } from "../../../../../chunks/index.js";
import { c as catsFilterSchema } from "../../../../../chunks/schema.js";
import { g as getAllCategories } from "../../../../../chunks/categories.service.js";
async function GET({ url: { searchParams } }) {
  const spObj = Object.fromEntries(searchParams);
  const filter = catsFilterSchema.safeParse(spObj);
  if (!filter.success) {
    return error(400, `Invalid request: ${JSON.stringify(filter.error)}`);
  } else {
    return json(await getAllCategories(filter.data));
  }
}
export {
  GET
};
