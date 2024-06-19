import { e as error, j as json } from "../../../../../chunks/index.js";
import { K as KindProducts } from "../../../../../chunks/constants2.js";
import { p as productsFilterSchema } from "../../../../../chunks/schema.js";
import { v as verifyAndPersistRawEvent } from "../../../../../chunks/nostrEvents.service.js";
import { g as getProductsByCatId, a as getProductsByCatName, b as getProductsByStallId, c as getAllProducts, d as createProduct } from "../../../../../chunks/products.service.js";
async function GET({ url: { searchParams } }) {
  const spObj = Object.fromEntries(searchParams);
  const filter = productsFilterSchema.safeParse(spObj);
  if (!filter.success) {
    return error(400, `Invalid request: ${JSON.stringify(filter.error)}`);
  } else if (filter.data.catId) {
    return json(await getProductsByCatId(filter.data));
  } else if (filter.data.catName) {
    return json(await getProductsByCatName(filter.data));
  } else if (filter.data.stallId) {
    console.log("filter.data.stallId", filter.data.stallId);
    return json(await getProductsByStallId(filter.data.stallId));
  } else {
    return json(await getAllProducts(filter.data));
  }
}
async function POST({ request }) {
  try {
    const verifiedEvent = await verifyAndPersistRawEvent(request, KindProducts);
    return json(await createProduct(verifiedEvent));
  } catch (e) {
    error(500, JSON.stringify(e));
  }
}
export {
  GET,
  POST
};
