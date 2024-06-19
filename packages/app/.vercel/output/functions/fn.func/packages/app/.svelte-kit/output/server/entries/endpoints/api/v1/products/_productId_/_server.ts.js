import { j as json, e as error } from "../../../../../../chunks/index.js";
import { K as KindProducts } from "../../../../../../chunks/constants2.js";
import { v as verifyAndPersistRawEvent } from "../../../../../../chunks/nostrEvents.service.js";
import { e as getProductById, u as updateProduct, f as deleteProduct } from "../../../../../../chunks/products.service.js";
const GET = async ({ params }) => {
  return json(await getProductById(params.productId));
};
const PUT = async ({ params, request }) => {
  try {
    const verifiedEvent = await verifyAndPersistRawEvent(request, KindProducts);
    return json(await updateProduct(params.productId, verifiedEvent));
  } catch (e) {
    error(500, JSON.stringify(e));
  }
};
const DELETE = async ({ params }) => {
  return json(await deleteProduct(params.productId));
};
export {
  DELETE,
  GET,
  PUT
};
